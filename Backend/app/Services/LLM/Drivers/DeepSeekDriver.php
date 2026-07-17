<?php

namespace App\Services\LLM\Drivers;

use App\Services\LLM\Contracts\LLMProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeepSeekDriver implements LLMProviderInterface
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
            throw new \Exception('DeepSeek API Key is not configured.');
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

        $response = Http::withToken($this->apiKey)
            ->post('https://api.deepseek.com/chat/completions', $payload);

        if (!$response->successful()) {
            Log::error('DeepSeek LLM call failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('Failed to call DeepSeek LLM API: ' . $response->body());
        }

        return $response->json('choices.0.message.content') ?? '';
    }
}
