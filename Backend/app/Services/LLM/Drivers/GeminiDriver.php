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

        // Cascade of resilient models in case primary is overloaded (503/429)
        $modelsToTry = array_values(array_unique([
            $this->model,
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-flash-lite-latest',
            'gemini-3-flash-preview',
        ]));

        $lastException = null;

        foreach ($modelsToTry as $index => $model) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$this->apiKey}";

            try {
                $response = Http::timeout(45)->post($url, $payload);

                if ($response->successful()) {
                    $text = $response->json('candidates.0.content.parts.0.text') ?? '';
                    if (!empty($text)) {
                        return $text;
                    }
                }

                $status = $response->status();
                $body = $response->body();

                Log::warning("Gemini model '{$model}' returned HTTP {$status}. Retrying fallback...", [
                    'status' => $status,
                    'error' => substr($body, 0, 300)
                ]);

                // If 503 (high demand) or 429 (rate limit), brief sleep before trying next model
                if (in_array($status, [429, 500, 502, 503, 504])) {
                    usleep(300000); // 300ms backoff
                    continue;
                }

                $lastException = new \Exception("Gemini API error ({$model}): HTTP {$status} - {$body}");
            } catch (\Exception $e) {
                Log::warning("Gemini model '{$model}' exception: " . $e->getMessage() . ". Retrying fallback...");
                $lastException = $e;
                usleep(300000);
            }
        }

        throw $lastException ?? new \Exception('Failed to generate response from all configured Gemini models.');
    }
}
