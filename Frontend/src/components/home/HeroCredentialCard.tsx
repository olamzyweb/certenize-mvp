import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Cpu,
  Lock,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export const HeroCredentialCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      {/* Outer ambient glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-emerald-500/20 to-cyan-500/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow" />

      <motion.div
        animate={{
          y: [0, -8, 0],
          rotateX: isFlipped ? 180 : 0,
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
          rotateX: { duration: 0.6, ease: 'easeInOut' },
        }}
        className="relative transform-style-3d cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <Card
          variant="glass"
          className="relative p-6 sm:p-7 rounded-3xl border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden bg-gradient-to-b from-card/90 via-card/75 to-background/90"
        >
          {/* Holographic foil shimmer */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gradient-to-br from-cyan-400/10 via-emerald-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">
                  Soulbound Token (SBT)
                </span>
                <h4 className="text-xs font-semibold text-foreground">
                  ERC-5192 Credential
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
              <Lock className="w-3 h-3" />
              Non-Transferable
            </div>
          </div>

          {/* Body content */}
          <div className="py-5 space-y-3.5">
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
                Certified Domain
              </span>
              <h3 className="text-lg font-bold font-display text-foreground mt-0.5">
                Solidity Smart Contracts & Security
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluated via Open-Ended Scenario & Code Rubric
              </p>
            </div>

            {/* Score & AI Metric */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-secondary/40 border border-white/5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>AI Grade</span>
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <div className="text-2xl font-black font-display text-gradient">
                  96%
                </div>
                <span className="text-[9px] text-emerald-400 font-medium">
                  &bull; Top 3% Candidate
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/40 border border-white/5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Proctoring</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-sm font-bold text-foreground mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">
                  Zero Telemetry Flags
                </span>
              </div>
            </div>

            {/* AI Multi-Model Tag */}
            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span>Evaluator Engine:</span>
              </div>
              <span className="font-mono text-foreground font-medium">
                Gemini 2.5 + Groq Llama 3.3
              </span>
            </div>
          </div>

          {/* Footer On-Chain Hash */}
          <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <Layers className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">0x71a4...92c8 (Sepolia)</span>
            </div>
            <span className="text-primary hover:underline flex items-center gap-1 shrink-0 font-sans">
              Verify On-Chain <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
