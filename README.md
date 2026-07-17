# SkillMint

> AI-powered skill assessment platform that issues tamper-proof, blockchain-verified credentials to Nigeria's informal tech learners — no institution required.

SkillMint assesses what you actually know, not where you went to school. A candidate pastes a YouTube course link, our AI scrapes the transcript, generates a hybrid assessment from that course + industry standards + real-world scenarios, and on passing, mints a Soulbound Token (SBT) via Certenize as permanent, verifiable proof of skill.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.2 / Laravel 12 |
| Frontend | TailwindCSS, Alpine.js, Blade |
| Database | MySQL 8 |
| AI Layer | Anthropic Claude API (claude-sonnet-4-6) |
| Blockchain | Certenize (SBT issuance) |
| Queue | Laravel Queues + Redis |
| Storage | Laravel Storage / S3-compatible |
| Deployment | cPanel shared hosting (primary), Laravel Cloud (optional) |

---

## Local Setup

### Requirements
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL
- Redis (for queues)

### Installation

```bash
git clone https://github.com/your-org/skillmint.git
cd skillmint

composer install
npm install

cp .env.example .env
php artisan key:generate

# Configure your .env (see Environment Variables section below)

php artisan migrate --seed
npm run dev
```

### Running Queues (required for AI assessment generation)
```bash
php artisan queue:work
```

---

## Environment Variables

See `.env.example` for the full list with descriptions.

Key variables:
- `ANTHROPIC_API_KEY` — Claude API key for assessment generation
- `CERTENIZE_API_KEY` — Certenize API key for SBT minting
- `YOUTUBE_API_KEY` — For transcript fetching
- `DB_*` — Database credentials
- `REDIS_*` — Queue driver credentials

---

## Project Structure

```
app/
├── Http/Controllers/
│   ├── AssessmentController.php     # Assessment flow
│   ├── CredentialController.php     # SBT issuance + verification
│   └── CourseController.php         # YouTube course ingestion
├── Services/
│   ├── AIAssessmentService.php      # Claude API integration
│   ├── TranscriptService.php        # YouTube transcript scraping
│   ├── ProctoringService.php        # Anti-cheat signal processing
│   └── CertenizeService.php         # Blockchain credential issuance
├── Models/
│   ├── User.php
│   ├── Assessment.php
│   ├── AssessmentSession.php
│   ├── Credential.php
│   └── Course.php
resources/views/          # Blade templates
database/migrations/      # DB schema history
```

---

## Deployment

See `docs/deployment-guide.md` for full instructions.

For cPanel deployments without SSH, use the `run.php` browser-based artisan workaround documented in the deployment guide.

---

## Running Tests

```bash
php artisan test
```

---

## Contributing

See `CONTRIBUTING.md` for code style and PR guidelines.

---

## License

Private — All rights reserved. Olamzyweb / Olamide Olanrewaju.
