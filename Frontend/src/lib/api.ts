import type {
  Assessment,
  AssessmentResult,
  Certificate,
  ApiResponse,
  GenerateAssessmentRequest,
  SubmitAssessmentRequest,
  MintCredentialRequest,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.certenize.olamzyweb.com.ng/api';

// ─── Fallback data ─────────────────────────────────────────────────────────────
const fallbackAssessment: Assessment = {
  id: 'fallback-1',
  title: 'Blockchain Fundamentals',
  topic: 'Blockchain',
  description: 'AI-generated assessment on Blockchain fundamentals',
  timeLimit: 1800,
  passingScore: 80,
  questions: [
    {
      id: 'q1',
      question: 'Explain what a blockchain is and why decentralization matters in its design.',
      type: 'industry',
      expectedLength: 'medium',
    },
    {
      id: 'q2',
      question: 'Describe the key differences between Proof of Work and Proof of Stake consensus mechanisms.',
      type: 'industry',
      expectedLength: 'medium',
    },
    {
      id: 'q3',
      question: 'A client reports that their smart contract is draining ETH unexpectedly. Walk through your debugging approach and identify what vulnerability might be at play.',
      type: 'scenario',
      expectedLength: 'long',
    },
    {
      id: 'q4',
      question: 'Write a simple Solidity function that transfers ETH to an address safely, avoiding reentrancy.',
      type: 'concept',
      expectedLength: 'long',
    },
    {
      id: 'q5',
      question: 'Explain what a Soulbound Token (SBT) is and why non-transferability is important for identity use-cases.',
      type: 'concept',
      expectedLength: 'medium',
    },
  ],
};

const fallbackCertificates: Certificate[] = [
  {
    id: 'cert-1',
    tokenId: '1',
    title: 'Blockchain Fundamentals Certificate',
    description: 'Successfully completed the Blockchain Fundamentals assessment',
    recipientAddress: '0x0000000000000000000000000000000000000000',
    issueDate: new Date().toISOString(),
    topic: 'Blockchain',
    score: 90,
    imageUrl: '/placeholder.svg',
    minted: true,
  },
];

// ─── Generic fetch helper ──────────────────────────────────────────────────────
async function apiFetch<T>(
  url: string,
  options: RequestInit,
  fallbackData: T
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Surface backend error message when available
      return {
        success: false,
        error: data?.error ?? `HTTP ${response.status}`,
        data: data?.data ?? undefined,
        manual_fallback: data?.manual_fallback ?? false,
      };
    }

    return { success: true, data: data?.data ?? data };
  } catch (error) {
    console.warn('API unavailable, using fallback data:', error);
    return { success: true, data: fallbackData };
  }
}

// ─── Public API functions ──────────────────────────────────────────────────────

export async function generateAssessment(
  request: GenerateAssessmentRequest
): Promise<ApiResponse<Assessment>> {
  return apiFetch<Assessment>(
    `${API_BASE_URL}/generate-quiz`,
    { method: 'POST', body: JSON.stringify(request) },
    { ...fallbackAssessment, topic: request.topic, title: `${request.topic} Assessment` }
  );
}

export async function submitAssessment(
  request: SubmitAssessmentRequest
): Promise<ApiResponse<AssessmentResult>> {
  const fallbackResult: AssessmentResult = {
    quizId: request.quizId,
    score: 0,
    totalQuestions: 5,
    percentage: 0,
    passed: false,
    answers: request.answers,
    ai_scores: [],
    completedAt: new Date().toISOString(),
  };

  return apiFetch<AssessmentResult>(
    `${API_BASE_URL}/submit-quiz`,
    { method: 'POST', body: JSON.stringify(request) },
    fallbackResult
  );
}

export async function mintCredential(
  request: MintCredentialRequest
): Promise<ApiResponse<Certificate>> {
  const fallbackCertificate: Certificate = {
    id: `cert-${Date.now()}`,
    title: `${request.certificateData.topic} Certificate`,
    description: `Successfully completed the ${request.certificateData.topic} assessment`,
    recipientAddress: request.walletAddress,
    recipientName: request.certificateData.recipientName,
    issueDate: new Date().toISOString(),
    topic: request.certificateData.topic,
    score: request.certificateData.score,
    imageUrl: '/placeholder.svg',
    minted: false,
  };

  const payload = {
    mint_token: request.mintToken,
    recipient_name: request.certificateData.recipientName,
    walletAddress: request.walletAddress,
    certificateData: request.certificateData,
  };

  return apiFetch<Certificate>(
    `${API_BASE_URL}/mint-credential`,
    { method: 'POST', body: JSON.stringify(payload) },
    fallbackCertificate
  );
}

export async function getCredentials(
  walletAddress: string
): Promise<ApiResponse<Certificate[]>> {
  return apiFetch<Certificate[]>(
    `${API_BASE_URL}/credentials/${walletAddress}`,
    { method: 'GET' },
    fallbackCertificates.map((cert) => ({ ...cert, recipientAddress: walletAddress }))
  );
}

// Legacy named exports so existing imports in other pages don't break
export { fallbackAssessment as fallbackQuiz };
export { generateAssessment as generateQuiz };
export { submitAssessment as submitQuiz };
