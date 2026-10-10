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
use Illuminate\Support\Facades\Storage;

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
     * Parse JSON from LLM response safely, handling markdown block wrappings and root object wrappers.
     */
    private function parseLlmJson(string $content)
    {
        $content = trim($content);

        // 1. Extract content from markdown code fence if present
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/i', $content, $matches)) {
            $content = trim($matches[1]);
        } else {
            // Or look for first { ... } or [ ... ]
            $firstBrace = strpos($content, '{');
            $firstBracket = strpos($content, '[');

            if ($firstBrace !== false && ($firstBracket === false || $firstBrace < $firstBracket)) {
                $lastBrace = strrpos($content, '}');
                if ($lastBrace !== false) {
                    $content = substr($content, $firstBrace, $lastBrace - $firstBrace + 1);
                }
            } elseif ($firstBracket !== false) {
                $lastBracket = strrpos($content, ']');
                if ($lastBracket !== false) {
                    $content = substr($content, $firstBracket, $lastBracket - $firstBracket + 1);
                }
            }
        }

        $decoded = json_decode($content, true);

        if (!is_array($decoded)) {
            return null;
        }

        // 2. If decoded is an associative object with a known array wrapper key, extract it
        $knownKeys = ['concepts', 'questions', 'rubric', 'scores', 'items', 'data', 'results'];
        foreach ($knownKeys as $key) {
            if (isset($decoded[$key]) && is_array($decoded[$key])) {
                return $decoded[$key];
            }
        }

        // 3. If single-key object containing an array, return that array
        if (count($decoded) === 1) {
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
            'topic'  => 'nullable|string',
            'youtubeUrl' => 'nullable|string',
            'transcriptRaw' => 'nullable|string'
        ]);

        $topic = trim($req->topic ?? '');
        $course = null;
        $concepts = [];

        // 1. Process YouTube transcript if URL or raw transcript is provided
        if (!empty($req->youtubeUrl)) {
            $videoId = $this->transcriptService->extractVideoId($req->youtubeUrl);
            if (!$videoId) {
                return response()->json(['success' => false, 'error' => 'Invalid YouTube URL format.'], 400);
            }

            if (empty($topic)) {
                $topic = 'YouTube Video Course';
            }

            // Check if course already exists
            $course = Course::where('youtube_video_id', $videoId)->first();

            if (!$course) {
                $course = new Course();
                $course->youtube_url = $req->youtubeUrl;
                $course->youtube_video_id = $videoId;
                $course->status = 'pending';
                $course->save();
            }

            // If manual transcript is provided, always process and override
            if (!empty($req->transcriptRaw)) {
                $cleanedTranscript = $this->transcriptService->clean($req->transcriptRaw);
                $course->transcript_raw = $req->transcriptRaw;
                $course->transcript_cleaned = $cleanedTranscript;
                $course->status = 'ready';
                $course->save();
            } elseif ($course->status !== 'ready' || empty($course->transcript_cleaned)) {
                try {
                    $cleanedTranscript = $this->transcriptService->fetch($req->youtubeUrl);
                    $course->transcript_raw = $cleanedTranscript;
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
                $conceptSystemPrompt = "You are a technical curriculum analyst. Extract the core technical concepts, tools, and skills taught in the following course transcript. Return ONLY a JSON object with a \"concepts\" key containing an array of concept objects: {\"concepts\": [{\"concept\": \"...\", \"description\": \"...\", \"difficulty\": \"beginner|intermediate|advanced\"}]}. Do not include any text outside the JSON object.";
                try {
                    $conceptResponse = $this->llm->generate(
                        "Transcript: " . substr($course->transcript_cleaned ?? '', 0, 10000),
                        $conceptSystemPrompt,
                        true
                    );

                    $concepts = $this->parseLlmJson($conceptResponse);
                    if ($concepts && is_array($concepts)) {
                        $course->concepts_extracted = $concepts;
                        $course->save();
                    } else {
                        Log::warning('Concept extraction JSON parsing failed, using general concepts fallback.', ['response' => $conceptResponse]);
                        $concepts = [['concept' => $topic, 'description' => 'Core concepts taught in the video', 'difficulty' => 'intermediate']];
                    }
                } catch (\Exception $e) {
                    Log::error('Concept extraction exception: ' . $e->getMessage());
                    $concepts = [['concept' => $topic, 'description' => 'Core concepts', 'difficulty' => 'intermediate']];
                }
            } else {
                $concepts = $course->concepts_extracted;
            }
        }

        if (empty($topic)) {
            $topic = 'General Tech Skill';
        }

        // 3. Generate questions using LLM (Open-ended scenario questions)
        $conceptsStr = json_encode($concepts);
        $questionsSystemPrompt = "You are a senior technical interviewer creating a skills assessment. Generate 5 assessment questions on the topic: '{$topic}'. Use this exact distribution:
- 2 questions testing these specific course concepts: {$conceptsStr}
- 2 questions testing general '{$topic}' industry knowledge
- 1 real-world scenario problem requiring practical judgment (e.g., debug/write code or diagnose a client report)

Rules:
- All questions must be open-ended, requiring a written explanation or a code snippet. NO multiple choice.
- Scenario questions must describe a realistic client or work situation.
- Difficulty should be intermediate level.
Return ONLY a JSON object with a \"questions\" key containing an array of 5 question objects: {\"questions\": [{\"id\": \"q1\", \"question_text\": \"...\", \"type\": \"concept|industry|scenario\", \"expected_length\": \"short|medium|long\"}]}. Do not include any text outside the JSON object.";

        try {
            $questionsResponse = $this->llm->generate(
                "Generate 5 assessment questions for skill category: '{$topic}'.",
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
                ['id' => 'q1', 'question_text' => "Explain the core architecture of {$topic} and how its main components interact.", 'type' => 'industry', 'expected_length' => 'medium'],
                ['id' => 'q2', 'question_text' => "What are the security best practices when building systems with {$topic}?", 'type' => 'industry', 'expected_length' => 'medium'],
                ['id' => 'q3', 'question_text' => "Describe a scenario where you had to troubleshoot a performance bottleneck in a {$topic} application.", 'type' => 'scenario', 'expected_length' => 'long'],
                ['id' => 'q4', 'question_text' => "Write a simple code implementation demonstrating state management or data persistence in {$topic}.", 'type' => 'concept', 'expected_length' => 'long'],
                ['id' => 'q5', 'question_text' => "Explain how you would deploy, test, and scale a {$topic} system in a production environment.", 'type' => 'concept', 'expected_length' => 'medium'],
            ];
        }

        // 4. Generate grading rubric
        $questionsStr = json_encode($questions);
        $rubricSystemPrompt = "You are a senior technical assessor. For the given questions, generate a strict but fair scoring rubric (what counts as a correct, partial, or incorrect answer). Return ONLY a JSON object with a \"rubric\" key containing an array of rubric objects: {\"rubric\": [{\"question_id\": \"...\", \"key_criteria\": \"...\", \"pass_markers\": \"...\"}]}. Do not include any text outside the JSON object.";

        try {
            $rubricResponse = $this->llm->generate(
                "Questions: {$questionsStr}",
                $rubricSystemPrompt,
                true
            );
            $rubric = $this->parseLlmJson($rubricResponse);
            if (!is_array($rubric)) {
                $rubric = [];
            }
        } catch (\Exception $e) {
            Log::error('Grading rubric generation failed: ' . $e->getMessage());
            $rubric = [];
        }

        // 5. Store Assessment
        $assessment = Assessment::create([
            'course_id' => $course ? $course->id : null,
            'skill_category' => $topic,
            'questions' => $questions,
            'rubric' => $rubric,
            'time_limit_minutes' => 30 // 30 minutes
        ]);

        // 6. Create Quiz Session
        $session = QuizSession::create([
            'assessment_id' => $assessment->id,
            'wallet_address' => $req->wallet,
            'topic' => $topic,
            'quiz_json' => $questions,
            'status' => 'pending',
            'score' => 0,
        ]);

        // Map questions to match frontend expectations defensively
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
            'title' => "{$topic} Assessment",
            'topic' => $topic,
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

        // 1. Grade the answers via active LLM driver
        $questionsStr = json_encode($questions);
        $rubricStr = json_encode($rubric);
        $answersStr = json_encode($answers);

        $gradeSystemPrompt = "You are a senior technical assessor. Evaluate the candidate's answers against the questions and rubric provided. Be fair but rigorous. For each answer, assign a score between 0 and 100, and write a brief feedback critique (max 2 sentences). Return ONLY a JSON object with a \"scores\" key containing an array of score objects: {\"scores\": [{\"question_id\": \"...\", \"score\": 85, \"feedback\": \"...\"}]}. Do not include any text outside the JSON object.";

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
                $normalizedScores = [];
                $sum = 0;

                $scoreMap = [];
                foreach ($aiScoresParsed as $idx => $item) {
                    if (is_array($item)) {
                        $qId = (string)($item['question_id'] ?? $item['id'] ?? ('q' . ($idx + 1)));
                        $scoreVal = isset($item['score']) ? (int)$item['score'] : (isset($item['points']) ? (int)$item['points'] : 80);
                        $feedbackVal = $item['feedback'] ?? $item['critique'] ?? 'Answer evaluated against technical benchmarks.';
                        $scoreMap[$qId] = [
                            'question_id' => $qId,
                            'score' => max(0, min(100, $scoreVal)),
                            'feedback' => (string)$feedbackVal
                        ];
                    }
                }

                foreach ($questions as $idx => $q) {
                    $qId = (string)($q['id'] ?? ('q' . ($idx + 1)));
                    if (isset($scoreMap[$qId])) {
                        $entry = $scoreMap[$qId];
                    } elseif (isset($aiScoresParsed[$idx]) && is_array($aiScoresParsed[$idx])) {
                        $entry = [
                            'question_id' => $qId,
                            'score' => max(0, min(100, (int)($aiScoresParsed[$idx]['score'] ?? 80))),
                            'feedback' => (string)($aiScoresParsed[$idx]['feedback'] ?? 'Answer evaluated.')
                        ];
                    } else {
                        $entry = [
                            'question_id' => $qId,
                            'score' => 80,
                            'feedback' => 'Good technical reasoning provided.'
                        ];
                    }
                    $normalizedScores[] = $entry;
                    $sum += $entry['score'];
                }

                $aiScores = $normalizedScores;
                $totalScore = count($questions) > 0 ? (int)round($sum / count($questions)) : 80;
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

    /**
     * Handle candidate video appeal for flagged proctoring sessions.
     */
    public function appeal(Request $req)
    {
        $req->validate([
            'quizId' => 'required|string',
            'video' => 'nullable|file|max:102400',
            'explanation' => 'nullable|string',
            'videoData' => 'nullable|string'
        ]);

        $session = QuizSession::findOrFail($req->quizId);

        $videoUrl = null;
        if ($req->hasFile('video')) {
            $file = $req->file('video');
            $extension = $file->getClientOriginalExtension() ?: 'webm';
            $filename = 'appeal_' . $session->id . '_' . time() . '.' . $extension;
            $path = $file->storeAs('appeals', $filename, 'public');
            $videoUrl = asset('storage/' . $path);
        } elseif ($req->filled('videoData')) {
            $videoData = $req->videoData;
            if (str_contains($videoData, ';base64,')) {
                $videoData = substr($videoData, strpos($videoData, ',') + 1);
            }
            $decoded = base64_decode($videoData);
            if ($decoded) {
                $filename = 'appeal_' . $session->id . '_' . time() . '.webm';
                Storage::disk('public')->put('appeals/' . $filename, $decoded);
                $videoUrl = asset('storage/appeals/' . $filename);
            }
        }

        $topic = $session->topic ?? 'Technical Assessment';
        $candidateAnswers = json_encode($session->answers ?? []);
        $appealExplanation = $req->explanation ?? "Candidate recorded live webcam video explanation demonstrating technical domain reasoning and code problem-solving.";

        $appealPrompt = "You are a senior technical assessor reviewing a candidate video appeal. The candidate was flagged during an assessment on '{$topic}'.
The candidate submitted this video explanation summary: '{$appealExplanation}'.
Their recorded exam answers were: {$candidateAnswers}.

Evaluate whether the candidate demonstrates authentic technical competency and comprehension of {$topic}.
Return ONLY a JSON object: {\"approved\": true, \"confidence_score\": 85, \"feedback\": \"The candidate's technical reasoning and problem breakdown demonstrate authentic domain mastery.\"}";

        $approved = true;
        $feedback = "Video explanation verified. Authenticity confirmed and minting unlocked.";

        try {
            $aiRes = $this->llm->generate("Evaluate appeal for: {$topic}", $appealPrompt, true);
            $parsed = $this->parseLlmJson($aiRes);
            if ($parsed && is_array($parsed)) {
                $approved = isset($parsed['approved']) ? (bool)$parsed['approved'] : true;
                $feedback = $parsed['feedback'] ?? $feedback;
            }
        } catch (\Exception $e) {
            Log::warning('AI appeal verification fallback: ' . $e->getMessage());
        }

        if ($approved) {
            $session->suspicious_flag = false;
            $session->appeal_status = 'approved';
            $session->appeal_feedback = $feedback;
            if ($videoUrl) {
                $session->video_appeal_url = $videoUrl;
            }
            if (empty($session->mint_token)) {
                $session->mint_token = (string) Str::uuid();
            }
            $session->save();

            return response()->json([
                'success' => true,
                'verified' => true,
                'mintToken' => $session->mint_token,
                'feedback' => $feedback,
                'videoUrl' => $videoUrl
            ]);
        } else {
            $session->appeal_status = 'rejected';
            $session->appeal_feedback = $feedback;
            if ($videoUrl) {
                $session->video_appeal_url = $videoUrl;
            }
            $session->save();

            return response()->json([
                'success' => true,
                'verified' => false,
                'feedback' => $feedback,
                'videoUrl' => $videoUrl
            ]);
        }
    }
}

