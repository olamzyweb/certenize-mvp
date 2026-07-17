import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, XCircle, Award, RotateCcw, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAssessmentStore } from '@/hooks/useAssessmentStore';
import { useConfetti } from '@/hooks/useConfetti';
import { Helmet } from 'react-helmet-async';

const Result = () => {
  const VITE_APP_NAME = import.meta.env.VITE_APP_NAME || 'Certenize';
  const navigate = useNavigate();
  const { lastResult, currentAssessment, resetAssessment } = useAssessmentStore();
  const { fireConfetti, fireStars } = useConfetti();

  useEffect(() => {
    if (!lastResult) {
      navigate('/quiz');
      return;
    }
    if (lastResult.passed) {
      setTimeout(() => fireConfetti(), 500);
      setTimeout(() => fireStars(), 1500);
    }
  }, [lastResult, navigate, fireConfetti, fireStars]);

  if (!lastResult || !currentAssessment) return null;

  const handleTryAgain = () => {
    resetAssessment();
    navigate('/quiz');
  };

  return (
    <>
      <Helmet>
        <title>Result | {VITE_APP_NAME}</title>
        <meta name="description" content={`View your assessment result on ${VITE_APP_NAME}.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* ─── Result icon ─────────────────────────────────────────── */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className={`w-32 h-32 rounded-3xl flex items-center justify-center
                    ${lastResult.passed
                      ? 'bg-success/20 border-2 border-success'
                      : 'bg-destructive/20 border-2 border-destructive'}`}
                >
                  {lastResult.passed
                    ? <Trophy className="w-16 h-16 text-success" />
                    : <XCircle className="w-16 h-16 text-destructive" />}
                </motion.div>
              </div>

              {/* ─── Headline ─────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl sm:text-4xl font-bold font-display mb-4">
                  {lastResult.passed ? 'Congratulations!' : 'Almost There!'}
                </h1>
                <p className="text-muted-foreground">
                  {lastResult.passed
                    ? "You've passed and earned a Soulbound credential!"
                    : "You didn't reach the passing score this time. Review the AI feedback below and try again."}
                </p>

                {/* Suspicious flag warning */}
                {lastResult.suspicious && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2">
                    <AlertCircle className="w-4 h-4" />
                    This session was flagged for review due to proctoring signals.
                  </div>
                )}
              </motion.div>

              {/* ─── Score card ────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card variant="glass" className="p-8 mb-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold font-display text-gradient mb-2">
                      {lastResult.percentage}%
                    </div>
                    <p className="text-muted-foreground">
                      AI-graded score across {lastResult.totalQuestions} questions
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Skill Topic</span>
                      <span className="font-medium">{currentAssessment.topic}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Passing Score</span>
                      <span className="font-medium">{currentAssessment.passingScore}%</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${lastResult.passed
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'}`}>
                        {lastResult.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-6">
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lastResult.percentage}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${lastResult.passed ? 'bg-success' : 'bg-destructive'}`}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="text-primary">{currentAssessment.passingScore}% to pass</span>
                      <span>100%</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* ─── AI Feedback per question ────────────────────────────── */}
              {lastResult.ai_scores && lastResult.ai_scores.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <h2 className="text-lg font-bold font-display mb-4">AI Feedback — Question by Question</h2>
                  <div className="space-y-3">
                    {lastResult.ai_scores.map((item, idx) => {
                      const question = currentAssessment.questions.find(q => q.id === item.question_id)
                        ?? currentAssessment.questions[idx];
                      const passed = item.score >= 70;
                      return (
                        <Card key={item.question_id} className="p-4 border border-border bg-card/60">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-medium flex-1">{question?.question}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {passed
                                ? <CheckCircle className="w-4 h-4 text-success" />
                                : <XCircle className="w-4 h-4 text-destructive" />}
                              <span className={`text-sm font-bold ${passed ? 'text-success' : 'text-destructive'}`}>
                                {item.score}/100
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.feedback}
                          </p>
                          {/* Candidate's answer */}
                          {lastResult.answers[idx] && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                View your answer
                              </summary>
                              <p className="mt-2 text-xs text-foreground/80 font-mono bg-secondary/50 rounded-lg p-3 whitespace-pre-wrap">
                                {lastResult.answers[idx]}
                              </p>
                            </details>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ─── Actions ─────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {lastResult.passed ? (
                  <>
                    <Link to="/mint">
                      <Button variant="hero" size="xl" className="w-full sm:w-auto">
                        <Award className="w-5 h-5" />
                        Mint Certificate
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Link to="/gallery">
                      <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                        View Gallery
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button variant="hero" size="xl" onClick={handleTryAgain}>
                      <RotateCcw className="w-5 h-5" />
                      Try Again
                    </Button>
                    <Link to="/">
                      <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                        Back Home
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Result;
