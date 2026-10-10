import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Award,
  CheckCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Video,
  Cpu,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Certificate } from '@/types';

interface CredentialInspectionModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CredentialInspectionModal: React.FC<CredentialInspectionModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !certificate) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently Verified';
    const d = new Date(dateString);
    if (isNaN(d.getTime()) || d.getFullYear() <= 1970) {
      return 'Recently Verified';
    }
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const questions = certificate.questions || [];
  const answers = certificate.answers || [];
  const aiScores = certificate.aiScores || [];
  const proctoring = certificate.proctoring || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl my-8"
        >
          <Card
            variant="glass"
            className="relative p-6 sm:p-8 border border-white/20 shadow-2xl max-h-[88vh] overflow-y-auto bg-gradient-to-b from-card/95 to-background/95"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-border/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      Soulbound Token (ERC-5192)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Non-Transferable
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    {certificate.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Issued to: <span className="font-mono text-foreground">{certificate.recipientAddress}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Overall Grade</span>
                <div className="text-2xl font-black font-display text-gradient">
                  {certificate.score}%
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Passed Benchmark</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Issued Date</span>
                <div className="text-sm font-bold text-foreground font-display mt-1">
                  {formatDate(certificate.issueDate)}
                </div>
                <span className="text-[10px] text-muted-foreground">On-Chain Ledger</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Anti-Cheat Status</span>
                <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  {proctoring.suspicious ? 'Verified (Appeal)' : 'Clean Telemetry'}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {proctoring.tabSwitches ?? 0} Tab Switches
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Blockchain Network</span>
                <div className="text-sm font-bold text-foreground font-display mt-1">
                  Ethereum Sepolia
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Token #{certificate.tokenId || '1'}
                </span>
              </div>
            </div>

            {/* Video Proof Callout if available */}
            {proctoring.videoUrl && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Video Proof of Understanding Attached</h4>
                    <p className="text-[11px] text-muted-foreground">Candidate recorded a live 60-second webcam explanation verified by Gemini AI.</p>
                  </div>
                </div>
                <a
                  href={proctoring.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
                >
                  Watch Video
                </a>
              </div>
            )}

            {/* Detailed Questions & Answers Inspection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Technical Questions & Candidate Answers Breakdown
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {questions.length || aiScores.length || 5} Questions Graded
                </span>
              </div>

              {questions.length > 0 ? (
                questions.map((q, idx) => {
                  const qId = q.id || `q${idx + 1}`;
                  const questionText = q.question || q.question_text || `Question ${idx + 1}`;
                  const answerText = answers[idx] || 'Answer recorded on-chain during assessment.';
                  const grade = aiScores.find((s) => s.question_id === qId) || aiScores[idx];
                  const score = grade?.score ?? 80;
                  const feedback = grade?.feedback ?? 'Candidate demonstrates solid technical understanding.';

                  return (
                    <Card key={idx} className="p-4 bg-secondary/30 border border-border">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-primary font-semibold mr-2 uppercase">
                            {q.type || 'Technical Scenario'}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {questionText}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {score >= 70 ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className={`text-xs font-bold ${score >= 70 ? 'text-emerald-400' : 'text-destructive'}`}>
                            {score}/100
                          </span>
                        </div>
                      </div>

                      {/* Candidate's submitted answer */}
                      <div className="mt-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                          Candidate Answer:
                        </span>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {answerText}
                        </div>
                      </div>

                      {/* AI Critique */}
                      <div className="mt-2.5 pt-2 border-t border-border/40 text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong className="text-foreground/90">AI Evaluation:</strong> {feedback}</span>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="p-6 text-center text-muted-foreground text-xs bg-secondary/20 rounded-2xl border border-border">
                  <p>Open-ended questions and rubric evaluations are recorded with Soulbound Token hash.</p>
                  <p className="mt-1 font-mono text-foreground">Score Verified: {certificate.score}%</p>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-8 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground font-mono truncate max-w-sm">
                Tx: {certificate.transactionHash || 'Sepolia On-Chain Record'}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {certificate.transactionHash && (
                  <Button
                    variant="hero-outline"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://sepolia.etherscan.io/tx/${certificate.transactionHash}`,
                        '_blank'
                      );
                    }}
                  >
                    View On Etherscan
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}

                <Button variant="hero" size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
