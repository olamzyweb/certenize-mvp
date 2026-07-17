// ─── Assessment Question ───────────────────────────────────────────────────────
// Open-ended questions; no multiple-choice options.
export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'concept' | 'industry' | 'scenario';
  expectedLength: 'short' | 'medium' | 'long';
}

// ─── Assessment (replaces Quiz) ────────────────────────────────────────────────
export interface Assessment {
  id: string;
  title: string;
  topic: string;
  description: string;
  questions: AssessmentQuestion[];
  timeLimit: number;    // seconds
  passingScore: number; // percentage (0–100)
}

// ─── Per-question AI score returned after grading ─────────────────────────────
export interface AIQuestionScore {
  question_id: string;
  score: number;        // 0–100
  feedback: string;
}

// ─── Assessment Result ─────────────────────────────────────────────────────────
export interface AssessmentResult {
  quizId: string;
  score: number;          // overall average score 0–100
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: string[];      // candidate text answers, index-matched to questions
  ai_scores: AIQuestionScore[];
  completedAt: string;
  mintToken?: string;
  suspicious?: boolean;
}

// ─── Certificate / SBT ────────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  tokenId?: string;
  title: string;
  description: string;
  recipientAddress: string;
  recipientName?: string;
  issueDate: string;
  topic: string;
  score: number;
  imageUrl: string;
  metadataUri?: string;
  transactionHash?: string;
  minted: boolean;
}

// ─── API generic wrapper ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  manual_fallback?: boolean;
}

// ─── Request types ─────────────────────────────────────────────────────────────
export interface GenerateAssessmentRequest {
  wallet: string;
  topic: string;
  youtubeUrl?: string;
  transcriptRaw?: string;
}

export interface SubmitAssessmentRequest {
  quizId: string;
  answers: string[];        // open-ended text answers
  walletAddress: string;
  timeTaken: number;
  tabSwitches: number;
  copyPasteEvents: number;
  windowBlurEvents: number;
}

export interface MintCredentialRequest {
  walletAddress: string;
  mintToken?: string;
  certificateData: {
    title: string;
    topic: string;
    score: number;
    recipientName?: string;
  };
}

// ─── Legacy aliases kept so Mint.tsx / Gallery.tsx don't break ─────────────────
/** @deprecated Use AssessmentQuestion */
export type QuizQuestion = AssessmentQuestion;
/** @deprecated Use Assessment */
export type Quiz = Assessment;
/** @deprecated Use AssessmentResult */
export type QuizResult = AssessmentResult;
/** @deprecated Use GenerateAssessmentRequest */
export type GenerateQuizRequest = GenerateAssessmentRequest;
/** @deprecated Use SubmitAssessmentRequest */
export type SubmitQuizRequest = SubmitAssessmentRequest;
