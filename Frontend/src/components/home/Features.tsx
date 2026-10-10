import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Shield,
  Zap,
  Lock,
  Youtube,
  Video,
  FileCheck2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const VITE_APP_NAME = import.meta.env.VITE_APP_NAME || 'Certenize';

const coreFeatures = [
  {
    icon: Youtube,
    title: 'Curriculum Ingestion Engine',
    tag: 'Any Online Course',
    description:
      'Paste any YouTube course or syllabus. Our NLP parser parses captions into high-density technical concepts and real-world engineering rubrics.',
    gradient: 'from-red-500/15 via-red-500/5 to-transparent',
    iconColor: 'text-red-400',
    border: 'border-red-500/20',
  },
  {
    icon: Brain,
    title: 'Generative Scenario Examination',
    tag: 'No Multiple Choice',
    description:
      'Generates 5 open-ended scenario and debugging problems. Answers are rigorously evaluated and critiqued line-by-line by Gemini & Groq LLMs.',
    gradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
    iconColor: 'text-cyan-400',
    border: 'border-blue-500/20',
  },
  {
    icon: Video,
    title: 'AI Video Proof of Understanding',
    tag: 'Active Anti-Cheat',
    description:
      'Detects browser tab switches and copy-paste signals. Flagged sessions unlock an interactive 60-second webcam video appeal verified by AI.',
    gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    iconColor: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  {
    icon: Lock,
    title: 'ERC-5192 Soulbound Credentials',
    tag: 'Permanent On-Chain',
    description:
      'Minted as non-transferable Soulbound Tokens on Ethereum (Sepolia). Cannot be sold, traded, or forged, guaranteeing true meritocracy.',
    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
];

const comparisons = [
  {
    feature: 'Skill Verification Method',
    traditional: 'Passive video completion or generic multiple-choice quiz',
    certenize: 'Generative technical scenario & code debugging assessments',
  },
  {
    feature: 'Credential Authenticity',
    traditional: 'Easily forged PDF certificates or LinkedIn text badges',
    certenize: 'Immutable ERC-5192 Soulbound Tokens on Ethereum blockchain',
  },
  {
    feature: 'Anti-Cheat & Identity',
    traditional: 'No proctoring; answers easily copied from ChatGPT',
    certenize: 'Real-time telemetry + 60s AI Video Proof of Understanding',
  },
  {
    feature: 'Employer Verification',
    traditional: 'Requires manual university calls or opaque portal logins',
    certenize: 'Public zero-wallet search bar & direct Etherscan ledger links',
  },
];

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            Core Technology Pillars
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            Why <span className="text-gradient">{VITE_APP_NAME}</span> Outperforms Traditional Certification
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Eliminating credential fraud and passive course clicking with generative AI examination and decentralized trust.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card
                  variant="glass"
                  className={`p-6 rounded-3xl h-full border ${feature.border} hover:border-primary/50 transition-all duration-300 flex flex-col justify-between hover-lift relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} pointer-events-none`} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-secondary/60 text-muted-foreground border border-border">
                        {feature.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-display text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Showcase Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                The Credential Paradigm Shift
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                How Certenize solves the Nigerian & Global tech talent verification crisis
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground text-xs font-mono">
                    <th className="pb-3 font-medium">Dimension</th>
                    <th className="pb-3 font-medium text-destructive/90">Traditional Certificates (Coursera/Udemy)</th>
                    <th className="pb-3 font-medium text-emerald-400">Certenize Protocol (Web3 + AI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {comparisons.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-4 font-semibold text-foreground font-display">
                        {row.feature}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          <span>{row.traditional}</span>
                        </div>
                      </td>
                      <td className="py-4 text-foreground/90 font-medium">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{row.certenize}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
