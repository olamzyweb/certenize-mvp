# SkillMint Tasks Checklist

Use this checklist to track the progress of the Certenize-to-SkillMint transformation. Mark tasks as:
- `[ ]` for pending tasks
- `[/]` for active/in-progress tasks
- `[x]` for completed and verified tasks

---

## 1. Modular LLM Service Setup (Backend)
- [ ] Create `LLMProviderInterface` contract
- [ ] Create `LLMManager` class extending `Illuminate\Support\Manager`
- [ ] Implement concrete drivers:
  - [ ] `GeminiDriver`
  - [ ] `GroqDriver`
  - [ ] `OpenAIDriver`
  - [ ] `AnthropicDriver`
  - [ ] `DeepSeekDriver`
- [ ] Add API keys to `.env` and map configuration in `config/services.php`
- [ ] Write integration test to verify provider swappability

## 2. YouTube Transcript Service (Backend)
- [ ] Create `TranscriptService` class
- [ ] Implement YouTube URL parsing & regex extraction of video IDs
- [ ] Implement HTML scraper for `ytInitialPlayerResponse` caption tracks
- [ ] Implement XML caption parser & transcript sanitization
- [ ] Implement fallback flag for manual transcript text paste

## 3. Database Migration & Core Models (Backend)
- [ ] Create migration for `courses` table
- [ ] Create migration for `assessments` table
- [ ] Update migration/model schema for `quiz_sessions` (to act as assessment sessions with telemetry and text answers)
- [ ] Run migrations and update `Course`, `Assessment`, and `QuizSession` Eloquent models

## 4. API Controller & AI Prompts (Backend)
- [ ] Update `QuizController` generate endpoint to support YouTube URL or fallback topic
- [ ] Create Concept Extraction prompts for the active LLM driver
- [ ] Create Assessment Generation prompts (30% transcript concepts, 40% industry-standards, 30% scenario tasks)
- [ ] Update `QuizController` submit endpoint to evaluate text answers using LLM grading against the generated rubric
- [ ] Implement proctoring threshold evaluator (flag session if too many violations logged)

## 5. React Frontend Overhaul (Frontend)
- [ ] Update branding and copy on `Home.tsx` to SkillMint
- [ ] Update TypeScript definitions in `types/index.ts` to support text answers and proctoring metrics
- [ ] Update API client helper `lib/api.ts` to communicate with new endpoint payloads
- [ ] Overhaul `Quiz.tsx` page:
  - [ ] Add YouTube URL input field and manual transcript paste fallback dialog
  - [ ] Change answer inputs from Multiple Choice options to Textareas and Code Editors
  - [ ] Implement browser telemetry listeners (`visibilitychange`, `window.blur`, `paste`) to log proctoring signals
- [ ] Overhaul `Result.tsx` page to display score breakdown, pass/fail status, and AI per-question feedback critiques

## 6. Testing & End-to-End Verification
- [ ] Verify database schema and run seed tests
- [ ] Manually test end-to-end user flow: YouTube URL -> Ingestion -> Assessment Generation -> Taking Assessment -> Proctoring logging -> AI Evaluation -> Soulbound Token Minting
- [ ] Document final walkthrough in `walkthrough.md`
