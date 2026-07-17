<?php

namespace App\Services\LLM\Drivers;

use App\Services\LLM\Contracts\LLMProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqDriver implements LLMProviderInterface
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
            Log::warning('Groq API Key is not set, trying fallback logic.');
        }

        $messages = [];
        if (!empty($systemPrompt)) {
            $messages[] = ['role' => 'system', 'content' => $systemPrompt];
        }
        $messages[] = ['role' => 'user', 'content' => $prompt];

        $payload = [
            'model' => $this->model,
            'messages' => $messages,
        ];

        if ($jsonMode) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $response = Http::withToken($this->apiKey ?? '')
            ->post('https://api.groq.com/openai/v1/chat/completions', $payload);

        if (!$response->successful()) {
            Log::error('Groq LLM call failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('Failed to call Groq LLM API: ' . $response->body());
        }

        return $response->json('choices.0.message.content') ?? '';
    }
}
