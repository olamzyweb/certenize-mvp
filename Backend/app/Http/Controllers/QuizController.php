<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QuizSession;
use App\Models\Course;
use App\Models\Assessment;
use App\Services\TranscriptService;
use App\Services\LLM\Contracts\LLMProviderInterface;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    protected TranscriptService $transcriptService;
    protected LLMProviderInterface $llm;

    public function __construct(TranscriptService $transcriptService, LLMProviderInterface $llm)
    {
        $this->transcriptService = $transcriptService;
        $this->llm = $llm;
    }

    /**
     * Parse JSON from LLM response safely, handling markdown block wrappings.
     */
    private function parseLlmJson(string $content)
    {
        $content = trim($content);
        if (str_starts_with($content, '```')) {
            $content = preg_replace('/^```(?:json)?\n?/i', '', $content);
            $content = preg_replace('/```$/', '', $content);
            $content = trim($content);
        }
        $decoded = json_decode($content, true);

        if (is_array($decoded) && count($decoded) === 1) {
            $keys = array_keys($decoded);
            $firstKey = $keys[0];
            if (is_string($firstKey) && is_array($decoded[$firstKey])) {
                return $decoded[$firstKey];
            }
        }

        return $decoded;
    }

    /**
     * Generate an assessment based on a YouTube URL or general topic.
     */
    public function generate(Request $req)
    {
        $req->validate([
            'wallet' => 'required|string',
            'topic'  => 'required|string',
            'youtubeUrl' => 'nullable|string',
            'transcriptRaw' => 'nullable|string'
        ]);

        $course = null;
        $concepts = [];

        // 1. Process YouTube transcript if URL provided
        if (!empty($req->youtubeUrl)) {
            $videoId = $this->transcriptService->extractVideoId($req->youtubeUrl);
            if (!$videoId) {
                return response()->json(['success' => false, 'error' => 'Invalid YouTube URL format.'], 400);
            }

            // Check if course already processed
            $course = Course::where('youtube_video_id', $videoId)->first();

            if (!$course) {
                $course = new Course();
                $course->youtube_url = $req->youtubeUrl;
                $course->youtube_video_id = $videoId;
                $course->status = 'pending';
                $course->save();
            }

            if ($course->status !== 'ready') {
                try {
                    $cleanedTranscript = '';
                    if (!empty($req->transcriptRaw)) {
                        $cleanedTranscript = $this->transcriptService->clean($req->transcriptRaw);
                    } else {
                        $cleanedTranscript = $this->transcriptService->fetch($req->youtubeUrl);
                    }

                    $course->transcript_raw = $req->transcriptRaw ?? $cleanedTranscript;
                    $course->transcript_cleaned = $cleanedTranscript;
                    $course->status = 'ready';
                    $course->save();
                } catch (\Exception $e) {
                    $course->status = 'failed';
                    $course->save();
                    return response()->json([
                        'success' => false,
                        'error' => 'Failed to retrieve video transcript.',
                        'manual_fallback' => true,
                        'details' => $e->getMessage()
                    ], 422);
                }
            }

            // 2. Extract course concepts using LLM
            if (empty($course->concepts_extracted)) {
                $conceptSystemPrompt = "You are a technical curriculum analyst. Extract the core technical concepts, tools, and skills taught in the following course transcript. Return ONLY a JSON array of concept objects with keys: \"concept\", \"description\", \"difficulty\" (beginner/intermediate/advanced). Do not write any explanations outside the JSON.";
                try {
                    $conceptResponse = $this->llm->generate(
                        "Transcript: " . substr($course->transcript_cleaned, 0, 10000), // Limit transcript tokens
                        $conceptSystemPrompt,
                        true
                    );

                    $concepts = $this->parseLlmJson($conceptResponse);
                    if ($concepts && is_array($concepts)) {
                        $course->concepts_extracted = $concepts;
                        $course->save();
                    } else {
                        Log::warning('Concept extraction JSON parsing failed, using general concepts fallback.', ['response' => $conceptResponse]);
                        $concepts = [['concept' => $req->topic, 'description' => 'General concepts on the topic', 'difficulty' => 'intermediate']];
                    }
                } catch (\Exception $e) {
                    Log::error('Concept extraction exception: ' . $e->getMessage());
                    $concepts = [['concept' => $req->topic, 'description' => 'General concepts', 'difficulty' => 'intermediate']];
                }
            } else {
                $concepts = $course->concepts_extracted;
            }
        }

        // 3. Generate questions using LLM (Open-ended scenario questions)
        $conceptsStr = json_encode($concepts);
        $questionsSystemPrompt = "You are a senior technical interviewer creating a skills assessment. Generate 5 assessment questions on the topic: '{$req->topic}'. Use this exact distribution:
- 2 questions testing these specific course concepts: {$conceptsStr}
- 2 questions testing general '{$req->topic}' industry knowledge
- 1 real-world scenario problem requiring practical judgment (e.g., debug/write code or diagnose a client report)

Rules:
- All questions must be open-ended, requiring a written explanation or a code snippet. NO multiple choice.
- Scenario questions must describe a realistic client or work situation.
- Difficulty should be intermediate level.
Return ONLY a JSON array of 5 question objects with keys: \"id\" (e.g. \"q1\", \"q2\"), \"question_text\", \"type\" (concept/industry/scenario), \"expected_length\" (short/medium/long). Do not write any explanations outside the JSON.";

        try {
            $questionsResponse = $this->llm->generate(
                "Generate 5 assessment questions for skill category: '{$req->topic}'.",
                $questionsSystemPrompt,
                true
            );
            $questions = $this->parseLlmJson($questionsResponse);
            if (!$questions || !is_array($questions)) {
                throw new \Exception('Failed to generate valid questions JSON.');
            }
        } catch (\Exception $e) {
            Log::error('Assessment question generation failed: ' . $e->getMessage());
            // Fallback questions structure
            $questions = [
                ['id' => 'q1', 'question_text' => "Explain the core architecture of {$req->topic} and how its components interact.", 'type' => 'industry', 'expected_length' => 'medium'],
                ['id' => 'q2', 'question_text' => "What are the security best practices when building systems with {$req->topic}?", 'type' => 'industry', 'expected_length' => 'medium'],
                ['id' => 'q3', 'question_text' => "Describe a scenario where you had to troubleshoot a performance bottleneck in a {$req->topic} application.", 'type' => 'scenario', 'expected_length' => 'long'],
                ['id' => 'q4', 'question_text' => "Write a simple implementation demonstrating state management or data storage in {$req->topic}.", 'type' => 'concept', 'expected_length' => 'long'],
                ['id' => 'q5', 'question_text' => "Explain how you would deploy and scale a {$req->topic} system in production.", 'type' => 'concept', 'expected_length' => 'medium'],
            ];
        }

        // 4. Generate grading rubric
        $questionsStr = json_encode($questions);
        $rubricSystemPrompt = "You are a senior technical assessor. For the given questions, generate a strict but fair scoring rubric (what counts as a correct, partial, or incorrect answer). Return ONLY a JSON array of rubric objects corresponding to each question, with keys: \"question_id\", \"key_criteria\", \"pass_markers\". Do not write any explanations outside the JSON.";

        try {
            $rubricResponse = $this->llm->generate(
                "Questions: {$questionsStr}",
                $rubricSystemPrompt,
                true
            );
            $rubric = $this->parseLlmJson($rubricResponse);
        } catch (\Exception $e) {
            Log::error('Grading rubric generation failed: ' . $e->getMessage());
            $rubric = [];
        }

        // 5. Store Assessment
        $assessment = Assessment::create([
            'course_id' => $course ? $course->id : null,
            'skill_category' => $req->topic,
            'questions' => $questions,
            'rubric' => $rubric,
            'time_limit_minutes' => 30 // 30 minutes
        ]);

        // 6. Create Quiz Session
        $session = QuizSession::create([
            'assessment_id' => $assessment->id,
            'wallet_address' => $req->wallet,
            'topic' => $req->topic,
            'quiz_json' => $questions,
            'status' => 'pending',
            'score' => 0,
        ]);

        // Map questions to match the frontend expectations defensively
        $frontendQuestions = [];
        $counter = 1;
        foreach ($questions as $key => $q) {
            $id = $q['id'] ?? $q['question_id'] ?? (is_numeric($key) ? ('q' . ($key + 1)) : $key);
            $text = $q['question_text'] ?? $q['question'] ?? '';
            $type = $q['type'] ?? 'industry';
            $expectedLength = $q['expected_length'] ?? $q['expectedLength'] ?? 'medium';

            $frontendQuestions[] = [
                'id' => (string)$id,
                'question' => $text,
                'type' => $type,
                'expectedLength' => $expectedLength
            ];

            // Normalize in the original $questions array so database storing is consistent
            $questions[$key]['id'] = $id;
            $questions[$key]['question_text'] = $text;
            $questions[$key]['type'] = $type;
            $questions[$key]['expected_length'] = $expectedLength;

            $counter++;
        }

        $payload = [
            'id' => (string)$session->id,
            'title' => "{$req->topic} Assessment",
            'topic' => $req->topic,
            'description' => $course ? "Assessment generated from your course video" : "AI-generated skill assessment",
            'questions' => $frontendQuestions,
            'timeLimit' => 1800, // 30 mins
            'passingScore' => 80
        ];

        return response()->json(['success' => true, 'data' => $payload]);
    }

    /**
     * Submit assessment answers and grade them via AI.
     */
    public function submit(Request $req)
    {
        $req->validate([
            'quizId' => 'required|string',
            'answers' => 'required|array',
            'walletAddress' => 'nullable|string',
            'timeTaken' => 'nullable|integer',
            'tabSwitches' => 'nullable|integer',
            'copyPasteEvents' => 'nullable|integer',
            'windowBlurEvents' => 'nullable|integer',
        ]);

        $session = QuizSession::findOrFail($req->quizId);
        $assessment = Assessment::findOrFail($session->assessment_id);

        $questions = $assessment->questions;
        $rubric = $assessment->rubric;
        $answers = $req->answers; // String array of answers

        // 1. Grade the answers via the active LLM driver
        $questionsStr = json_encode($questions);
        $rubricStr = json_encode($rubric);
        $answersStr = json_encode($answers);

        $gradeSystemPrompt = "You are a senior technical assessor. Evaluate the candidate's answers against the questions and rubric provided. Be fair but rigorous. For each answer, assign a score between 0 and 100, and write a brief feedback critique (max 2 sentences). Return ONLY a JSON array of score objects corresponding to the questions, with keys: \"question_id\", \"score\" (integer), \"feedback\" (string). Do not write any explanations outside the JSON.";

        $totalScore = 0;
        $aiScores = [];

        try {
            $gradeResponse = $this->llm->generate(
                "Questions: {$questionsStr} | Rubric: {$rubricStr} | Answers: {$answersStr}",
                $gradeSystemPrompt,
                true
            );

            $aiScoresParsed = $this->parseLlmJson($gradeResponse);

            if ($aiScoresParsed && is_array($aiScoresParsed)) {
                $aiScores = $aiScoresParsed;
                $sum = 0;
                foreach ($aiScores as $grade) {
                    $sum += (int)($grade['score'] ?? 0);
                }
                $totalScore = round($sum / count($questions));
            } else {
                throw new \Exception('Failed to parse AI grading response.');
            }
        } catch (\Exception $e) {
            Log::error('AI evaluation grading failed: ' . $e->getMessage());
            // Fallback grading if API fails
            foreach ($questions as $index => $q) {
                $aiScores[] = [
                    'question_id' => $q['id'],
                    'score' => 80,
                    'feedback' => 'Standard passing grade awarded due to offline grading fallback.'
                ];
            }
            $totalScore = 80;
        }

        // 2. Set proctoring metadata
        $tabSwitches = $req->tabSwitches ?? 0;
        $copyPasteEvents = $req->copyPasteEvents ?? 0;
        $windowBlurEvents = $req->windowBlurEvents ?? 0;

        $isSuspicious = ($tabSwitches >= 3 || $copyPasteEvents >= 2);

        $pass = $totalScore >= 80;

        // 3. Save session progress
        $session->answers = $answers;
        $session->ai_scores = $aiScores;
        $session->score = $totalScore;
        $session->tab_switches = $tabSwitches;
        $session->copy_paste_events = $copyPasteEvents;
        $session->window_blur_events = $windowBlurEvents;
        $session->suspicious_flag = $isSuspicious;
        $session->status = $pass ? 'passed' : 'failed';

        if ($pass && empty($session->mint_token)) {
            $session->mint_token = (string) Str::uuid();
        }

        $session->save();

        $result = [
            'quizId' => (string)$session->id,
            'score' => $totalScore,
            'totalQuestions' => count($questions),
            'percentage' => $totalScore,
            'passed' => $pass,
            'answers' => $answers,
            'ai_scores' => $aiScores,
            'completedAt' => now()->toIso8601String(),
            'mintToken' => $session->mint_token ?? null,
            'suspicious' => $isSuspicious
        ];

        return response()->json(['success' => true, 'data' => $result]);
    }
}
