// This file must be a module - explicit exports below satisfy isolatedModules.
import { create } from 'zustand';
import type { Assessment, AssessmentResult } from '@/types';

interface AssessmentState {
  currentAssessment: Assessment | null;
  currentAnswers: string[];           // open-ended text answers
  currentQuestionIndex: number;
  timeRemaining: number;
  isSubmitting: boolean;
  lastResult: AssessmentResult | null;

  // Proctoring telemetry
  tabSwitches: number;
  copyPasteEvents: number;
  windowBlurEvents: number;

  setAssessment: (assessment: Assessment) => void;
  setAnswer: (questionIndex: number, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  setTimeRemaining: (time: number) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setResult: (result: AssessmentResult) => void;
  incrementTabSwitches: () => void;
  incrementCopyPaste: () => void;
  incrementWindowBlur: () => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  currentAssessment: null,
  currentAnswers: [],
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isSubmitting: false,
  lastResult: null,
  tabSwitches: 0,
  copyPasteEvents: 0,
  windowBlurEvents: 0,

  setAssessment: (assessment) =>
    set({
      currentAssessment: assessment,
      currentAnswers: new Array(assessment.questions.length).fill(''),
      currentQuestionIndex: 0,
      timeRemaining: assessment.timeLimit,
      lastResult: null,
      tabSwitches: 0,
      copyPasteEvents: 0,
      windowBlurEvents: 0,
    }),

  setAnswer: (questionIndex, answer) => {
    const { currentAnswers } = get();
    const updated = [...currentAnswers];
    updated[questionIndex] = answer;
    set({ currentAnswers: updated });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentAssessment } = get();
    if (currentAssessment && currentQuestionIndex < currentAssessment.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  goToQuestion: (index) => {
    const { currentAssessment } = get();
    if (currentAssessment && index >= 0 && index < currentAssessment.questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setResult: (result) => set({ lastResult: result }),
  incrementTabSwitches: () => set((s) => ({ tabSwitches: s.tabSwitches + 1 })),
  incrementCopyPaste: () => set((s) => ({ copyPasteEvents: s.copyPasteEvents + 1 })),
  incrementWindowBlur: () => set((s) => ({ windowBlurEvents: s.windowBlurEvents + 1 })),

  resetAssessment: () =>
    set({
      currentAssessment: null,
      currentAnswers: [],
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isSubmitting: false,
      lastResult: null,
      tabSwitches: 0,
      copyPasteEvents: 0,
      windowBlurEvents: 0,
    }),
}));

// Legacy alias so existing imports in other components don't break
export { useAssessmentStore as useQuizStore };
