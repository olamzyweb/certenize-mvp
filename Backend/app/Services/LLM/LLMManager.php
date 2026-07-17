<?php

namespace App\Services\LLM;

use Illuminate\Support\Manager;
use App\Services\LLM\Contracts\LLMProviderInterface;
use App\Services\LLM\Drivers\GroqDriver;
use App\Services\LLM\Drivers\GeminiDriver;
use App\Services\LLM\Drivers\OpenAIDriver;
use App\Services\LLM\Drivers\AnthropicDriver;
use App\Services\LLM\Drivers\DeepSeekDriver;

class LLMManager extends Manager
{
    public function getDefaultDriver()
    {
        return $this->container['config']->get('services.llm.provider', 'groq');
    }

    public function createGroqDriver(): LLMProviderInterface
    {
        return new GroqDriver(
            $this->container['config']->get('services.llm.groq.key'),
            $this->container['config']->get('services.llm.groq.model', 'llama-3.3-70b-versatile')
        );
    }

    public function createGeminiDriver(): LLMProviderInterface
    {
        return new GeminiDriver(
            $this->container['config']->get('services.llm.gemini.key'),
            $this->container['config']->get('services.llm.gemini.model', 'gemini-1.5-pro')
        );
    }

    public function createOpenaiDriver(): LLMProviderInterface
    {
        return new OpenAIDriver(
            $this->container['config']->get('services.llm.openai.key'),
            $this->container['config']->get('services.llm.openai.model', 'gpt-4o-mini')
        );
    }

    public function createAnthropicDriver(): LLMProviderInterface
    {
        return new AnthropicDriver(
            $this->container['config']->get('services.llm.anthropic.key'),
            $this->container['config']->get('services.llm.anthropic.model', 'claude-3-5-sonnet-latest')
        );
    }

    public function createDeepseekDriver(): LLMProviderInterface
    {
        return new DeepSeekDriver(
            $this->container['config']->get('services.llm.deepseek.key'),
            $this->container['config']->get('services.llm.deepseek.model', 'deepseek-chat')
        );
    }
}
