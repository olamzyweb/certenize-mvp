# Implementation Plan — SkillMint AI-Verified Skill Credentialing

Convert the existing Certenize (Cred-AI) platform into **SkillMint**, an AI-powered skill assessment and credentialing platform that ingests YouTube courses, generates dynamic open-ended assessments, monitors candidate browser activity (proctoring), grades open-ended answers, and mints Soulbound Tokens (SBTs).

## User Review Required

> [!IMPORTANT]
> **LLM API Keys & Environment Setup:**
> - You will need to add the API keys for the providers you want to use (Gemini, Groq, OpenAI, Anthropic, or DeepSeek) to the backend `.env` file.
> - The active provider can be dynamically swapped using `LLM_PROVIDER` and `LLM_MODEL` in `.env`.

> [!WARNING]
> **YouTube Captions Limitations:**
> - Some YouTube videos do not have auto-generated or manual captions, or they might block scraper requests. We will implement a manual transcript text paste fallback in the UI so users can still proceed with any video.

## Proposed Changes

We will implement the project in a modular, decoupled way. All changes will be tracked in the main progress file.

---

### Component 1: Multi-LLM Swappable Provider (Backend)

We will build a generic LLM service layer with a manager class so that you can switch between Groq, Gemini, DeepSeek, ChatGPT, and Claude.

#### [NEW] [LLMProviderInterface.php](file:///c:/xampp/htdocs/certenize/Backend/app/Services/LLM/Contracts/LLMProviderInterface.php)
Interface defining unified text generation methods.
- `public function generate(string $prompt, string $systemPrompt = '', bool $jsonMode = false): string;`

#### [NEW] [LLMManager.php](file:///c:/xampp/htdocs/certenize/Backend/app/Services/LLM/LLMManager.php)
Extends Laravel's `Illuminate\Support\Manager` to load the appropriate driver:
- `createGroqDriver()`
- `createGeminiDriver()`
- `createOpenaiDriver()`
- `createAnthropicDriver()`
- `createDeepseekDriver()`

#### [NEW] Base/Individual Drivers (under `app/Services/LLM/Drivers/`)
- `GroqDriver.php`
- `GeminiDriver.php`
- `OpenAIDriver.php`
- `AnthropicDriver.php`
- `DeepSeekDriver.php`

---

### Component 2: Transcript Ingestion (Backend)

#### [NEW] [TranscriptService.php](file:///c:/xampp/htdocs/certenize/Backend/app/Services/TranscriptService.php)
Service that:
- Extracts YouTube video ID from standard URLs.
- Fetches video HTML to parse `ytInitialPlayerResponse` for caption tracks.
- Downloads XML caption tracks, strips XML/HTML tags, and returns a sanitized raw transcript.
- Handles failure states gracefully, indicating that manual pasting is required.

---

### Component 3: Database & Core Models (Backend)

We will create migrations and models to handle the YouTube-based assessments and proctoring telemetry.

#### [NEW] Migration for `courses` & `assessments`
Create tables matching the new schema:
- `courses`: `id`, `youtube_url`, `youtube_video_id`, `title`, `transcript_raw`, `transcript_cleaned`, `concepts_extracted` (JSON), `status` (pending/ready/failed).
- `assessments`: `id`, `course_id` (nullable), `skill_category`, `questions` (JSON), `rubric` (JSON), `time_limit_minutes`.
- Update `quiz_sessions` (or create a new `assessment_sessions` table) to support open-ended text answers and proctoring telemetry fields (`tab_switches`, `copy_paste_events`, `window_blur_events`, `suspicious_flag`).

#### [NEW] Models
- `Course.php`
- `Assessment.php`
- Update `QuizSession.php` to handle new attributes.

---

### Component 4: API Controllers (Backend)

#### [MODIFY] [QuizController.php](file:///c:/xampp/htdocs/certenize/Backend/app/Http/Controllers/QuizController.php)
Update endpoints:
- `POST /api/generate-quiz` (accepts `youtube_url` or `topic` / `category`, triggers async assessment generation or manual fallback).
- `POST /api/submit-quiz` (evaluates text/code answers using the active LLM driver against the generated rubric, scores them, and flags suspicious proctoring sessions).

---

### Component 5: React Frontend Overhaul (Frontend)

We will update the frontend pages to support text/code answer submissions, YouTube URL integration, and browser proctoring telemetry.

#### [MODIFY] [Home.tsx](file:///c:/xampp/htdocs/certenize/Frontend/src/pages/Home.tsx)
- Update branding and text from "Certenize" to "SkillMint".
- Explain the new "YouTube course transcript assessment" concept.

#### [MODIFY] [Quiz.tsx](file:///c:/xampp/htdocs/certenize/Frontend/src/pages/Quiz.tsx)
- Support pasting a YouTube video URL with loading indicator.
- Support fallback manual transcript input.
- Change the Quiz rendering from multiple-choice options to **open-ended Textareas/Code input fields**.
- Add event listeners for `visibilitychange` (tab switching), `window.onblur` (leaving screen), and `paste` (detecting copy-pasted code) to count proctoring violations.
- Submit the proctoring violations counts to `/api/submit-quiz`.

#### [MODIFY] [Result.tsx](file:///c:/xampp/htdocs/certenize/Frontend/src/pages/Result.tsx)
- Render the score, pass/fail state.
- Render the detailed AI rubric critique and feedback per question.

#### [MODIFY] [types/index.ts](file:///c:/xampp/htdocs/certenize/Frontend/src/types/index.ts)
- Update TypeScript types for `QuizQuestion` (no options), `SubmitQuizRequest` (answers as string array, proctoring metrics), and `QuizResult` (AI feedback per question).

---

## Verification Plan

### Automated Tests
We will write test scripts to verify the core services:
- Run `php artisan test` to check backend services.
- Test `TranscriptService` against a sample YouTube video URL.
- Test `LLMManager` integration with a mock driver and verify swappability.

### Manual Verification
- Start the backend server (`php artisan serve`) and frontend development server (`npm run dev`).
- Paste a valid YouTube URL on the home screen.
- Verify that transcript is fetched and open-ended questions are generated.
- Take the assessment, trigger some tab-switches or copy-pastes, and submit.
- Verify that the proctoring events are captured in the DB and that the LLM successfully grades the assessment.
- Verify that Soulbound Tokens can still be minted upon scoring >= 80%.
