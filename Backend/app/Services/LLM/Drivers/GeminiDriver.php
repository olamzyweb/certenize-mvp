<?php

namespace App\Services\LLM\Drivers;

use App\Services\LLM\Contracts\LLMProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiDriver implements LLMProviderInterface
{
    protected ?string $apiKey;
    protected string $model;

    public function __construct(?string $apiKey, string $model)
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
    }

    public function generate(string $prompt, string $systemPrompt = '', bool $jsonMode = false): string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Gemini API Key is not configured.');
        }

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        if (!empty($systemPrompt)) {
            $payload['systemInstruction'] = [
                'parts' => [
                    ['text' => $systemPrompt]
                ]
            ];
        }

        if ($jsonMode) {
            $payload['generationConfig'] = [
                'responseMimeType' => 'application/json'
            ];
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::post($url, $payload);

        if (!$response->successful()) {
            Log::error('Gemini LLM call failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('Failed to call Gemini LLM API: ' . $response->body());
        }

        return $response->json('candidates.0.content.parts.0.text') ?? '';
    }
}
