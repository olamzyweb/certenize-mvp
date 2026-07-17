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
        $this->assertNull($service->extractVideoId('https://google.com'));
    }

    public function test_cleaning_raw_xml_transcript()
    {
        $service = new TranscriptService();
        $xml = '<?xml version="1.0" encoding="utf-8" ?><transcript><text start="0" dur="1">hello</text><text start="1" dur="1">world &amp; friends</text></transcript>';

        $cleaned = $service->clean($xml);
        $this->assertEquals('hello world & friends', $cleaned);
    }

    public function test_fetching_and_parsing_flow()
    {
        Http::fake([
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ' => Http::response(
                '<html><body><script>var ytInitialPlayerResponse = {"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":[{"baseUrl":"https://youtube.com/api/timedtext/mock","languageCode":"en"}]}}};</script></body></html>',
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
