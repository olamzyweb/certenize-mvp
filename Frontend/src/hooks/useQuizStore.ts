// Redirect all imports of the old useQuizStore to the new useAssessmentStore.
// This keeps backward-compatibility for any components that haven't been updated.
export { useAssessmentStore as useQuizStore, useAssessmentStore } from './useAssessmentStore';
