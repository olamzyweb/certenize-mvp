import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Send, RefreshCw, Youtube,
  ClipboardPaste, AlertTriangle, BookOpen, Code2
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout/Navbar';
import { WalletGuard } from '@/components/auth/WalletGuard';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateAssessment, submitAssessment } from '@/lib/api';
import { useAssessmentStore } from '@/hooks/useAssessmentStore';
import { toast } from '@/hooks/use-toast';
import type { Assessment } from '@/types';
import { Helmet } from 'react-helmet-async';

const SKILL_CATEGORIES = [
  'Laravel / PHP',
  'React / TypeScript',
  'Python / Data Science',
  'UI/UX Design',
  'Blockchain / Web3',
  'Node.js / Backend',
  'DevOps / Cloud',
  'SQL & Databases',
];

// Badge styling per question type
const TYPE_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  concept: { label: 'Concept', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: BookOpen },
  industry: { label: 'Industry', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: BookOpen },
  scenario: { label: 'Scenario', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Code2 },
};

const QuizPage = () => {
  const VITE_APP_NAME = import.meta.env.VITE_APP_NAME || 'Certenize';
  const navigate = useNavigate();
  const { address } = useAccount();

  // UI state
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showTranscriptFallback, setShowTranscriptFallback] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [suspicionWarning, setSuspicionWarning] = useState(false);

  const answerRefs = useRef<HTMLTextAreaElement[]>([]);

  const {
    currentAssessment,
    currentAnswers,
    currentQuestionIndex,
    isSubmitting,
    tabSwitches,
    copyPasteEvents,
    windowBlurEvents,
    setAssessment,
    setAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    setSubmitting,
    setResult,
    resetAssessment,
    incrementTabSwitches,
    incrementCopyPaste,
    incrementWindowBlur,
  } = useAssessmentStore();

  // ─── Proctoring listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentAssessment) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        incrementTabSwitches();
        setSuspicionWarning(true);
        setTimeout(() => setSuspicionWarning(false), 4000);
      }
    };

    const handleBlur = () => {
      incrementWindowBlur();
    };

    const handlePaste = () => {
      incrementCopyPaste();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('paste', handlePaste);
    };
  }, [currentAssessment, incrementTabSwitches, incrementCopyPaste, incrementWindowBlur]);

  // ─── Start assessment ───────────────────────────────────────────────────────
  const handleStartAssessment = async () => {
    const topic = selectedTopic || customTopic;
    if (!topic) {
      toast({ title: 'Select a topic', description: 'Please choose or enter a skill topic', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await generateAssessment({
        wallet: address || '',
        topic,
        youtubeUrl: youtubeUrl || undefined,
        transcriptRaw: manualTranscript || undefined,
      });

      if (response.success && response.data) {
        setAssessment(response.data as Assessment);
        setStartTime(Date.now());
      } else if (response.manual_fallback) {
        // YouTube transcript fetch failed — offer manual paste
        setShowTranscriptFallback(true);
        toast({
          title: "Couldn't fetch video transcript",
          description: 'Please paste the video transcript manually to continue.',
          variant: 'destructive',
        });
      } else {
        throw new Error(response.error || 'Assessment generation failed');
      }
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Submit assessment ──────────────────────────────────────────────────────
  const handleSubmitAssessment = useCallback(async () => {
    if (!currentAssessment || !address) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await submitAssessment({
        quizId: currentAssessment.id,
        answers: currentAnswers,
        walletAddress: address,
        timeTaken,
        tabSwitches,
        copyPasteEvents,
        windowBlurEvents,
      });

      if (response.success && response.data) {
        setResult(response.data);
        navigate('/result');
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      toast({ title: 'Submission error', description: String(error), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }, [
    currentAssessment, currentAnswers, address, startTime,
    tabSwitches, copyPasteEvents, windowBlurEvents,
    setSubmitting, setResult, navigate,
  ]);

  const handleTimeUp = useCallback(() => {
    toast({ title: "Time's up!", description: 'Submitting your answers now…' });
    handleSubmitAssessment();
  }, [handleSubmitAssessment]);

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];
  const isLastQuestion = currentAssessment &&
    currentQuestionIndex === currentAssessment.questions.length - 1;
  const answeredCount = currentAnswers.filter((a) => a.trim() !== '').length;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Assessment | {VITE_APP_NAME}</title>
        <meta name="description" content="Take an AI-generated skill assessment and earn a blockchain-verified credential." />
      </Helmet>

      <WalletGuard>
        <div className="min-h-screen bg-background">
          <Navbar />

          {/* Suspicion warning banner */}
          <AnimatePresence>
            {suspicionWarning && (
              <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                className="fixed top-16 inset-x-0 z-50 bg-amber-500/90 text-black text-sm font-medium py-3 px-4 text-center flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Tab switch detected — your session is being monitored.
              </motion.div>
            )}
          </AnimatePresence>

          <main className="pt-24 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <AnimatePresence mode="wait">
                {/* ── Setup Screen ─────────────────────────────────────── */}
                {!currentAssessment ? (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="text-center mb-10">
                      <h1 className="text-3xl sm:text-4xl font-bold font-display mb-4">
                        Start Your Assessment
                      </h1>
                      <p className="text-muted-foreground max-w-xl mx-auto">
                        Paste a YouTube course link — our AI will read the transcript and generate
                        an open-ended assessment tailored to what you actually learned. Score 80%+
                        to earn a Soulbound credential.
                      </p>
                    </div>

                    {/* YouTube URL input */}
                    <Card className="p-6 mb-6 border border-border bg-card/60 backdrop-blur-sm">
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        YouTube Course URL <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Input
                        id="youtube-url-input"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="mb-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        When provided, the AI reads the actual video content to create personalised questions.
                        Leave blank to use a skill category instead.
                      </p>
                    </Card>

                    {/* Manual transcript fallback */}
                    {showTranscriptFallback && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <Card className="p-6 mb-6 border border-amber-500/40 bg-amber-500/5">
                          <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-amber-400">
                            <ClipboardPaste className="w-4 h-4" />
                            Paste transcript manually
                          </label>
                          <Textarea
                            id="manual-transcript"
                            placeholder="Paste the video transcript or any relevant course content here…"
                            value={manualTranscript}
                            onChange={(e) => setManualTranscript(e.target.value)}
                            className="min-h-[140px] text-sm"
                          />
                        </Card>
                      </motion.div>
                    )}

                    {/* Skill category grid */}
                    <p className="text-sm text-muted-foreground mb-3">Select a skill category:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {SKILL_CATEGORIES.map((topic) => (
                        <motion.button
                          key={topic}
                          id={`topic-${topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                          onClick={() => { setSelectedTopic(topic); setCustomTopic(''); }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={`p-3 rounded-xl text-sm font-medium transition-all border
                            ${selectedTopic === topic
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {topic}
                        </motion.button>
                      ))}
                    </div>

                    {/* Custom topic */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-4 text-xs text-muted-foreground">or enter a custom topic</span>
                      </div>
                    </div>
                    <Input
                      id="custom-topic-input"
                      placeholder="e.g. Django REST Framework, Figma prototyping…"
                      value={customTopic}
                      onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(''); }}
                      className="mb-8 max-w-md mx-auto"
                    />

                    <div className="flex justify-center">
                      <Button
                        id="start-assessment-btn"
                        variant="hero"
                        size="xl"
                        onClick={handleStartAssessment}
                        disabled={loading || (!selectedTopic && !customTopic)}
                      >
                        {loading ? (
                          <><RefreshCw className="w-5 h-5 animate-spin" /> Generating Assessment…</>
                        ) : (
                          <><Send className="w-5 h-5" /> Generate Assessment</>
                        )}
                      </Button>
                    </div>
                  </motion.div>

                ) : (
                  /* ── Assessment Screen ──────────────────────────────── */
                  <motion.div
                    key="assessment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h1 className="text-xl font-bold font-display">{currentAssessment.title}</h1>
                        <p className="text-sm text-muted-foreground">
                          {answeredCount} of {currentAssessment.questions.length} answered
                        </p>
                      </div>
                      <QuizTimer initialTime={currentAssessment.timeLimit} onTimeUp={handleTimeUp} />
                    </div>

                    {/* Proctoring badge */}
                    <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
                      <span className={`px-2 py-1 rounded-full border ${tabSwitches >= 3 ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-border'}`}>
                        Tab switches: {tabSwitches}
                      </span>
                      <span className={`px-2 py-1 rounded-full border ${copyPasteEvents >= 2 ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-border'}`}>
                        Paste events: {copyPasteEvents}
                      </span>
                    </div>

                    {/* Question navigation dots */}
                    <div className="flex justify-center gap-2 mb-8 flex-wrap">
                      {currentAssessment.questions.map((_, index) => (
                        <button
                          key={index}
                          id={`nav-dot-${index}`}
                          onClick={() => goToQuestion(index)}
                          className={`w-3 h-3 rounded-full transition-all
                            ${index === currentQuestionIndex
                              ? 'bg-primary scale-125'
                              : currentAnswers[index]?.trim()
                                ? 'bg-primary/50'
                                : 'bg-secondary hover:bg-accent'
                            }`}
                        />
                      ))}
                    </div>

                    {/* Question card */}
                    {currentQuestion && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuestionIndex}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="p-6 mb-6 border border-border bg-card/70 backdrop-blur-sm">
                            {/* Type badge */}
                            {(() => {
                              const badge = TYPE_BADGE[currentQuestion.type] ?? TYPE_BADGE['industry'];
                              const Icon = badge.icon;
                              return (
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border mb-4 ${badge.color}`}>
                                  <Icon className="w-3 h-3" />
                                  {badge.label}
                                  {' · '}
                                  {currentQuestion.expectedLength === 'long'
                                    ? 'Detailed answer'
                                    : currentQuestion.expectedLength === 'medium'
                                    ? 'Paragraph answer'
                                    : 'Brief answer'}
                                </span>
                              );
                            })()}

                            <p className="text-sm text-muted-foreground mb-1">
                              Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                            </p>
                            <h2 className="text-lg font-semibold mb-5 leading-relaxed">
                              {currentQuestion.question}
                            </h2>

                            <Textarea
                              id={`answer-${currentQuestionIndex}`}
                              ref={(el) => { if (el) answerRefs.current[currentQuestionIndex] = el; }}
                              placeholder={
                                currentQuestion.type === 'scenario'
                                  ? 'Describe your approach, diagnosis, or solution…'
                                  : currentQuestion.expectedLength === 'long'
                                  ? 'Write your code or detailed explanation here…'
                                  : 'Write your answer here…'
                              }
                              value={currentAnswers[currentQuestionIndex] ?? ''}
                              onChange={(e) => setAnswer(currentQuestionIndex, e.target.value)}
                              className={`min-h-[${currentQuestion.expectedLength === 'long' ? '200' : '120'}px] text-sm font-mono resize-y`}
                            />
                          </Card>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                      </Button>

                      {isLastQuestion ? (
                        <Button
                          id="submit-assessment-btn"
                          variant="hero"
                          onClick={handleSubmitAssessment}
                          disabled={isSubmitting || answeredCount < currentAssessment.questions.length}
                        >
                          {isSubmitting ? (
                            <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Submitting…</>
                          ) : (
                            <><Send className="w-4 h-4 mr-2" /> Submit Assessment</>
                          )}
                        </Button>
                      ) : (
                        <Button variant="default" onClick={nextQuestion}>
                          Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-center mt-8">
                      <Button variant="ghost" size="sm" onClick={resetAssessment} className="text-muted-foreground">
                        <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </WalletGuard>
    </>
  );
};

export default QuizPage;
