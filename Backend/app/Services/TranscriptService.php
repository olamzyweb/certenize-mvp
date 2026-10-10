<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranscriptService
{
    /**
     * Extract the video ID from a YouTube URL (handles desktop, mobile, shorts, live, and embed).
     */
    public function extractVideoId(string $url): ?string
    {
        $url = trim($url);
        $pattern = '/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i';
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Helper to extract a complete, balanced JSON object substring from text starting at an offset.
     */
    private function extractJsonObject(string $str, int $startOffset): ?string
    {
        $firstBrace = strpos($str, '{', $startOffset);
        if ($firstBrace === false) {
            return null;
        }

        $length = strlen($str);
        $depth = 0;
        $inString = false;
        $escape = false;

        for ($i = $firstBrace; $i < $length; $i++) {
            $char = $str[$i];

            if ($escape) {
                $escape = false;
                continue;
            }

            if ($char === '\\') {
                $escape = true;
                continue;
            }

            if ($char === '"' || $char === "'") {
                if ($inString === $char) {
                    $inString = false;
                } elseif ($inString === false) {
                    $inString = $char;
                }
                continue;
            }

            if (!$inString) {
                if ($char === '{') {
                    $depth++;
                } elseif ($char === '}') {
                    $depth--;
                    if ($depth === 0) {
                        return substr($str, $firstBrace, $i - $firstBrace + 1);
                    }
                }
            }
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
            // Fetch video page HTML with desktop browser headers
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            ])->get("https://www.youtube.com/watch?v={$videoId}");

            if (!$response->successful()) {
                throw new \Exception("Failed to fetch YouTube page. HTTP status: " . $response->status());
            }

            $html = $response->body();

            // Locate ytInitialPlayerResponse marker
            $patterns = [
                'ytInitialPlayerResponse = ',
                'var ytInitialPlayerResponse = ',
                'window["ytInitialPlayerResponse"] = ',
                'ytInitialPlayerResponse='
            ];

            $startPos = false;
            foreach ($patterns as $pattern) {
                $pos = strpos($html, $pattern);
                if ($pos !== false) {
                    $startPos = $pos + strlen($pattern);
                    break;
                }
            }

            if ($startPos === false) {
                throw new \Exception("Could not extract player response. Video may be private, age-restricted, or blocked.");
            }

            $jsonStr = $this->extractJsonObject($html, $startPos);
            if (!$jsonStr) {
                throw new \Exception("Malformed player response JSON script.");
            }

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
                throw new \Exception("Scraped transcript is empty.");
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
     * Clean raw XML or plain-text transcript into sanitized human-readable text.
     */
    public function clean(string $rawInput): string
    {
        $rawInput = trim($rawInput);
        if (empty($rawInput)) {
            return '';
        }

        // 1. Check if input is XML formatted (from YouTube timedtext endpoint)
        if (str_contains($rawInput, '<text') || str_contains($rawInput, '<transcript')) {
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($rawInput);
            $texts = [];
            if ($xml && isset($xml->text)) {
                foreach ($xml->text as $textNode) {
                    $texts[] = (string)$textNode;
                }
            } else {
                preg_match_all('/<text[^>]*>(.*?)<\/text>/is', $rawInput, $matches);
                $texts = $matches[1] ?? [];
            }

            if (!empty($texts)) {
                $cleanedTexts = array_map(function($t) {
                    $decoded = html_entity_decode($t, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    return strip_tags($decoded);
                }, $texts);
                $fullText = implode(' ', $cleanedTexts);
                $fullText = preg_replace('/\s+/', ' ', $fullText);
                return trim($fullText);
            }
        }

        // 2. Plain text input (manually pasted from YouTube "Show transcript" or notes)
        // Strip timestamps like 00:15, 1:23:45, [00:00], etc.
        $cleaned = preg_replace('/\[?\b\d{1,2}:\d{2}(?::\d{2})?\b\]?/', ' ', $rawInput);
        $cleaned = html_entity_decode($cleaned, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $cleaned = strip_tags($cleaned);
        $cleaned = preg_replace('/\s+/', ' ', $cleaned);

        return trim($cleaned);
    }
}

