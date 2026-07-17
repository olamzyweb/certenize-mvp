<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranscriptService
{
    /**
     * Extract the video ID from a YouTube URL.
     */
    public function extractVideoId(string $url): ?string
    {
        $pattern = '/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/';
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Fetch and clean the transcript of a YouTube video.
     */
    public function fetch(string $url): string
    {
        $videoId = $this->extractVideoId($url);
        if (!$videoId) {
            throw new \Exception('Invalid YouTube URL.');
        }

        try {
            // Fetch video page HTML
            // Using a realistic User-Agent is helpful to get the correct desktop response
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language' => 'en-US,en;q=0.9',
            ])->get("https://www.youtube.com/watch?v={$videoId}");

            if (!$response->successful()) {
                throw new \Exception("Failed to fetch YouTube page. HTTP status: " . $response->status());
            }

            $html = $response->body();

            // Find ytInitialPlayerResponse
            $jsonStartPattern = 'ytInitialPlayerResponse = ';
            $startPos = strpos($html, $jsonStartPattern);
            if ($startPos === false) {
                // Try alternative pattern
                $jsonStartPattern = 'var ytInitialPlayerResponse = ';
                $startPos = strpos($html, $jsonStartPattern);
            }

            if ($startPos === false) {
                // Try window["ytInitialPlayerResponse"] pattern
                $jsonStartPattern = 'window["ytInitialPlayerResponse"] = ';
                $startPos = strpos($html, $jsonStartPattern);
            }

            if ($startPos === false) {
                throw new \Exception("Could not extract player response. Auto-generated captions may not be accessible.");
            }

            $startPos += strlen($jsonStartPattern);
            // Locate ending semicolon of the json block
            $endPos = strpos($html, '};', $startPos);
            if ($endPos === false) {
                $endPos = strpos($html, '</script>', $startPos);
            }

            if ($endPos === false) {
                throw new \Exception("Malformed player response script.");
            }

            $jsonStr = substr($html, $startPos, $endPos - $startPos + 1);
            // Trim any ending whitespace or semicolon
            $jsonStr = rtrim(trim($jsonStr), ';');

            $data = json_decode($jsonStr, true);
            if (!$data) {
                throw new \Exception("Failed to parse player response JSON.");
            }

            // Find caption tracks
            $captionTracks = $data['captions']['playerCaptionsTracklistRenderer']['captionTracks'] ?? null;
            if (!$captionTracks || empty($captionTracks)) {
                throw new \Exception("This video does not have any captions or transcripts available.");
            }

            // Pick English track or first available
            $trackUrl = null;
            foreach ($captionTracks as $track) {
                if (isset($track['languageCode']) && strpos(strtolower($track['languageCode']), 'en') !== false) {
                    $trackUrl = $track['baseUrl'] ?? null;
                    break;
                }
            }

            if (!$trackUrl) {
                $trackUrl = $captionTracks[0]['baseUrl'] ?? null;
            }

            if (!$trackUrl) {
                throw new \Exception("No caption track URL found.");
            }

            // Fetch transcript XML
            $xmlResponse = Http::get($trackUrl);
            if (!$xmlResponse->successful()) {
                throw new \Exception("Failed to fetch caption track. HTTP status: " . $xmlResponse->status());
            }

            $cleaned = $this->clean($xmlResponse->body());
            if (empty($cleaned)) {
                throw new \Exception("Scraped transcript is empty (blocked by YouTube's bot detection).");
            }
            return $cleaned;

        } catch (\Exception $e) {
            Log::error('YouTube transcript fetch exception', [
                'video_id' => $videoId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Clean raw XML transcript into human-readable text.
     */
    public function clean(string $rawXml): string
    {
        // Simple XML parser to get <text> tags
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($rawXml);
        if (!$xml) {
            // Fallback regex if XML loading fails
            preg_match_all('/<text[^>]*>(.*?)<\/text>/is', $rawXml, $matches);
            $texts = $matches[1] ?? [];
        } else {
            $texts = [];
            foreach ($xml->text as $textNode) {
                $texts[] = (string)$textNode;
            }
        }

        if (empty($texts)) {
            return '';
        }

        // Decode entities and strip basic HTML tag occurrences
        $cleanedTexts = array_map(function($t) {
            $decoded = html_entity_decode($t, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            return strip_tags($decoded);
        }, $texts);

        // Join texts with spaces and clean duplicate whitespaces
        $fullText = implode(' ', $cleanedTexts);
        $fullText = preg_replace('/\s+/', ' ', $fullText);

        return trim($fullText);
    }
}
