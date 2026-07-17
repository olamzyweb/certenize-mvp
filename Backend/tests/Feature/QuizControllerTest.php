<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\QuizSession;
use App\Models\Course;
use App\Models\Assessment;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuizControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_assessment_without_youtube()
    {
        // Mock the LLM calls
        Http::fake([
            'https://api.groq.com/openai/v1/chat/completions' => Http::sequence()
                ->push([
                    'choices' => [
                        [
                            'message' => [
                                'content' => '[
                                    {"id": "q1", "question_text": "Explain blockchain principles.", "type": "industry", "expected_length": "medium"},
                                    {"id": "q2", "question_text": "Debug this contract.", "type": "scenario", "expected_length": "long"}
                                ]'
                            ]
                        ]
                    ]
                ])
                ->push([
                    'choices' => [
                        [
                            'message' => [
                                'content' => '[
                                    {"question_id": "q1", "key_criteria": "Understanding", "pass_markers": "Must explain blocks"},
                                    {"question_id": "q2", "key_criteria": "Debugging", "pass_markers": "Must find reentrancy"}
                                ]'
                            ]
                        ]
                    ]
                ])
        ]);

        $response = $this->postJson('/api/generate-quiz', [
            'wallet' => '0x7b5d01b14ffd206d9fa4101dd8d7986065d3a4ea',
            'topic' => 'Blockchain',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'title',
                'topic',
                'questions' => [
                    '*' => ['id', 'question', 'type', 'expectedLength']
                ]
            ]
        ]);
    }

    public function test_submit_and_grade_assessment()
    {
        // Setup database structure
        $course = Course::create([
            'youtube_url' => 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            'youtube_video_id' => 'dQw4w9WgXcQ',
            'status' => 'ready'
        ]);

        $assessment = Assessment::create([
            'course_id' => $course->id,
            'skill_category' => 'Blockchain',
            'questions' => [
                ['id' => 'q1', 'question_text' => 'What is decentralization?']
            ],
            'rubric' => [
                ['question_id' => 'q1', 'key_criteria' => 'Standard', 'pass_markers' => 'No single point of control']
            ]
        ]);

        $session = QuizSession::create([
            'assessment_id' => $assessment->id,
            'wallet_address' => '0x7b5d01b14ffd206d9fa4101dd8d7986065d3a4ea',
            'topic' => 'Blockchain',
            'quiz_json' => $assessment->questions,
            'status' => 'pending'
        ]);

        Http::fake([
            'https://api.groq.com/openai/v1/chat/completions' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => '[
                                {"question_id": "q1", "score": 90, "feedback": "Great explanation."}
                            ]'
                        ]
                    ]
                ]
            ], 200)
        ]);

        $response = $this->postJson('/api/submit-quiz', [
            'quizId' => $session->id,
            'answers' => ['It means distribution of authority.'],
            'walletAddress' => '0x7b5d01b14ffd206d9fa4101dd8d7986065d3a4ea',
            'tabSwitches' => 1,
            'copyPasteEvents' => 0
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'passed' => true,
                'score' => 90,
                'suspicious' => false
            ]
        ]);
    }
}
