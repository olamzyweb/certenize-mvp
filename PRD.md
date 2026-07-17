# Product Requirements Document (PRD)
## SkillMint — AI-Verified Skill Credentialing Platform

**Version:** 1.0  
**Author:** Olamide Olanrewaju (Olamzyweb)  
**Last Updated:** July 2026  
**Status:** Active Development

---

## 1. Problem Statement

Nigeria has a credential fraud crisis. Screening exercises in Niger State found 80% of Ministry of Education staff held forged certificates. JAMB's 2023 Direct Entry exercise uncovered 1,665 fake A-Level results. Forgery hubs operate openly in Lagos, producing fake NYSC certificates, university degrees, and professional licences on demand.

At the same time, a parallel crisis exists on the other side: millions of legitimately skilled Nigerians — self-taught developers, bootcamp graduates, YouTube-educated designers, NACOS-trained backend engineers — have no credible way to prove what they know. The institutions that could vouch for them either don't exist, weren't attended, or issue certificates too slow and too bureaucratically to matter in a fast-moving job market.

Existing solutions (Akowe, VerifyEd, Blockcerts) attack only the first problem: they digitize certificates that institutions already issued. They require institutional buy-in, MOU negotiations, and university cooperation — all of which move at Nigerian-government speed.

**SkillMint attacks both problems simultaneously, without needing a single institution to cooperate.**

---

## 2. Solution

SkillMint is an AI-powered skill assessment and credentialing platform. It:

1. Accepts a YouTube course link (or selects from a skill category)
2. Scrapes and processes the course transcript using the YouTube API
3. Uses Claude AI to generate a hybrid assessment combining:
   - Concepts from the specific course the candidate took
   - General industry-standard knowledge for that skill
   - Real-world, practical scenario problems
4. Administers the assessment under lightweight proctoring (tab-switch detection, timing signals, copy-paste detection)
5. On passing, mints a Soulbound Token (SBT) via Certenize — a non-transferable, blockchain-verified credential permanently tied to the candidate's identity
6. Issues a public verifier link that any employer can use to confirm the credential without contacting any institution

The AI is the institution.

---

## 3. Target Users

### Primary Users

**Candidate (Skill Earner)**
- Self-taught Nigerian developers, designers, data analysts
- Bootcamp and cohort graduates (NACOS, AltSchool, Semicolon, side-hustle learners)
- Anyone who learned a skill on YouTube, Udemy, or informally but lacks paper proof
- Age range: 18–35

**Employer / Recruiter (Credential Verifier)**
- Nigerian tech companies, agencies, startups
- HR managers and recruiters who need a faster, cheaper alternative to manual verification
- Remote-first companies hiring Nigerian talent

### Secondary Users
- Bootcamp organizers who want to issue AI-verified certificates to their graduates
- Freelancers who want to build a trusted public skill portfolio

---

## 4. Core Features

### Must Have (MVP)

| # | Feature | Description |
|---|---|---|
| 1 | YouTube Course Ingestion | Candidate pastes a YouTube URL; system fetches transcript via API |
| 2 | AI Assessment Generation | Claude generates a hybrid question set from transcript + industry standards + scenarios |
| 3 | Assessment Administration | Timed, browser-based assessment with proctoring signals |
| 4 | Pass/Fail Evaluation | AI evaluates open-ended answers against a rubric |
| 5 | SBT Minting | On pass, Certenize issues a Soulbound Token to candidate's wallet |
| 6 | Public Credential Page | Shareable URL that verifies credential authenticity |
| 7 | Candidate Dashboard | View assessments taken, credentials earned, share links |
| 8 | Employer Verifier | Paste wallet address or credential ID to verify |

### Should Have (Phase 2)

| # | Feature | Description |
|---|---|---|
| 9 | Async Video Response | 60-second recorded explanation of one answer — human signal for employers |
| 10 | Skill Categories | Pre-built tracks (Laravel, UI/UX, Python, etc.) without needing a YouTube link |
| 11 | Retry Policy | Cooldown period before retaking a failed assessment |
| 12 | Bootcamp Mode | Organizations can bulk-enroll candidates and issue branded credentials |
| 13 | LinkedIn Badge Export | One-click add credential to LinkedIn profile |

### Nice to Have (Phase 3)

| # | Feature | Description |
|---|---|---|
| 14 | Credential Marketplace | Employers post jobs, filter by verified SBT credentials |
| 15 | AI Study Gap Report | After assessment, AI shows exactly what the candidate missed and recommends resources |
| 16 | Multi-language support | Pidgin-accessible assessment instructions |
| 17 | Mobile App | Android-first PWA or native app |

---

## 5. Out of Scope (v1)

- Issuing or replacing academic/university certificates
- Integration with WAEC, JAMB, NYSC databases
- Payment or subscription model (free for MVP/competition demo)
- Non-tech skill categories (trades, artisan skills) — future consideration
- Any hardware/biometric proctoring

---

## 6. User Flow (Core)

```
Candidate registers
        ↓
Pastes YouTube course URL (or selects skill category)
        ↓
System fetches + processes transcript
        ↓
AI generates personalized assessment (background job)
        ↓
Candidate notified → starts timed assessment
        ↓
Proctoring signals logged throughout
        ↓
Candidate submits answers
        ↓
AI evaluates answers against rubric
        ↓
    [PASS]                    [FAIL]
      ↓                          ↓
SBT minted via           Feedback report shown
Certenize                 Retry after cooldown
      ↓
Public credential page generated
      ↓
Candidate shares link with employers
```

---

## 7. Non-Functional Requirements

- **Assessment generation time:** Under 60 seconds from URL submission to ready state
- **Assessment reliability:** AI rubric must score consistently (same answer = same score across runs)
- **Uptime:** 99% during assessment windows
- **Data privacy:** All personal data handled per NDPR (Nigerian Data Protection Regulation)
- **Blockchain:** SBTs are non-transferable and permanently public on the Certenize network
- **Browser support:** Chrome, Firefox, Edge (desktop-first, mobile-responsive)

---

## 8. Success Metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Assessments completed | 500+ |
| SBTs minted | 200+ |
| Employer verifications | 50+ |
| Assessment pass rate | 40–60% (too high = too easy, too low = too hard) |
| Candidate return rate | 30%+ (retake after fail or take new skill) |

---

## 9. Assumptions & Risks

| Assumption/Risk | Mitigation |
|---|---|
| YouTube transcript API access is stable | Cache transcripts; support manual transcript paste as fallback |
| Certenize API remains available | Abstract behind CertenizeService; can swap to direct blockchain in future |
| Candidates may use AI to answer | Scenario-based questions + proctoring signals + async video layer |
| Low wallet adoption in Nigeria | Offer custodial wallet option — we hold the wallet on their behalf |
| Claude API latency on assessment generation | Queue-based async generation; candidate waits in lobby |
