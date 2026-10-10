<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\TranscriptService;
use Illuminate\Support\Facades\Http;

class TranscriptServiceTest extends TestCase
{
    public function test_video_id_extraction()
    {
        $service = new TranscriptService();

        $this->assertEquals('dQw4w9WgXcQ', $service->extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
        $this->assertEquals('dQw4w9WgXcQ', $service->extractVideoId('https://youtu.be/dQw4w9WgXcQ'));
        $this->assertEquals('dQw4w9WgXcQ', $service->extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'));
        $this->assertEquals('dQw4w9WgXcQ', $service->extractVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ'));
        $this->assertEquals('dQw4w9WgXcQ', $service->extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'));
        $this->assertEquals('dQw4w9WgXcQ', $service->extractVideoId('https://www.youtube.com/live/dQw4w9WgXcQ'));
        $this->assertEquals('dQw4w9WgXcQ', $service->extractVideoId('  https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s  '));
        $this->assertNull($service->extractVideoId('https://google.com'));
    }

    public function test_cleaning_raw_xml_transcript()
    {
        $service = new TranscriptService();
        $xml = '<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0" dur="1">hello</text><text start="1" dur="1">world &amp; friends</text></transcript>';

        $cleaned = $service->clean($xml);
        $this->assertEquals('hello world & friends', $cleaned);
    }

    public function test_cleaning_plain_text_transcript_with_timestamps()
    {
        $service = new TranscriptService();
        $plain = "00:00 Welcome to Laravel tutorial. 01:15 Today we build an API &amp; controllers.";

        $cleaned = $service->clean($plain);
        $this->assertEquals('Welcome to Laravel tutorial. Today we build an API & controllers.', $cleaned);
    }

    public function test_fetching_and_parsing_flow_with_nested_json()
    {
        Http::fake([
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ' => Http::response(
                '<html><body><script>var ytInitialPlayerResponse = {"trackingParams":{"nested":"data"};"nested2":{"val":123},"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":[{"baseUrl":"https://youtube.com/api/timedtext/mock","languageCode":"en"}]}}}; var somethingElse = 1;</script></body></html>',
                200
            ),
            'https://youtube.com/api/timedtext/mock' => Http::response(
                '<?xml version="1.0" encoding="utf-8" ?><transcript><text>Never gonna give you up</text></transcript>',
                200
            )
        ]);

        $service = new TranscriptService();
        $transcript = $service->fetch('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

        $this->assertEquals('Never gonna give you up', $transcript);
    }
}

