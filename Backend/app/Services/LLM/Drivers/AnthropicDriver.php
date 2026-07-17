<?php

namespace App\Services\LLM\Drivers;

use App\Services\LLM\Contracts\LLMProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnthropicDriver implements LLMProviderInterface
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
            throw new \Exception('Anthropic API Key is not configured.');
        }

        $payload = [
            'model' => $this->model,
            'max_tokens' => 4000,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ]
        ];

        if (!empty($systemPrompt)) {
            $payload['system'] = $systemPrompt;
        }

        if ($jsonMode) {
            // Append explicit JSON instructions to prompt if JSON mode is requested
            $payload['messages'][0]['content'] .= "\nIMPORTANT: Return your response strictly as a JSON object, without markdown formatting or code blocks.";
        }

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json'
        ])->post('https://api.anthropic.com/v1/messages', $payload);

        if (!$response->successful()) {
            Log::error('Anthropic LLM call failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('Failed to call Anthropic LLM API: ' . $response->body());
        }

        return $response->json('content.0.text') ?? '';
    }
}
