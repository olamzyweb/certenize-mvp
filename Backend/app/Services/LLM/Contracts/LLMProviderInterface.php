<?php

namespace App\Services\LLM\Contracts;

interface LLMProviderInterface
{
    /**
     * Generate text from the LLM based on prompt.
     *
     * @param string $prompt
     * @param string $systemPrompt
     * @param bool $jsonMode
     * @return string
     */
    public function generate(string $prompt, string $systemPrompt = '', bool $jsonMode = false): string;
}
