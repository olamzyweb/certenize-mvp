<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\LLM\LLMManager;
use App\Services\LLM\Contracts\LLMProviderInterface;

class LLMManagerTest extends TestCase
{
    public function test_llm_manager_resolves_default_driver()
    {
        $manager = $this->app->make(LLMManager::class);
        $this->assertNotNull($manager);

        $defaultDriver = $manager->driver();
        $this->assertInstanceOf(LLMProviderInterface::class, $defaultDriver);
    }
}
