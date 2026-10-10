import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Cpu, Video, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

const steps = [
  {
    step: '01',
    title: 'Input Video or Topic',
    subtitle: 'Automated Curriculum Ingestion',
    description:
      'Paste any YouTube tutorial, bootcamp lecture, or skill topic. Our AI engine extracts technical concepts, code frameworks, and domain dependencies.',
    icon: Youtube,
    badge: 'Transcript NLP Engine',
    color: 'from-red-500/20 to-amber-500/10',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
  },
  {
    step: '02',
    title: 'Generative Exam',
    subtitle: 'Scenario & Code Assessment',
    description:
      'Take 5 rigorous, open-ended scenario and debugging questions. No multiple-choice guessing. Real-time telemetry guards against tab-switching and copy-paste.',
    icon: Cpu,
    badge: 'Multi-LLM Grading',
    color: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-cyan-400',
  },
  {
    step: '03',
    title: 'Proof of Understanding',
    subtitle: 'Webcam AI Video Appeal',
    description:
      'If flagged for anomalies, record a quick 60-second webcam breakdown of your code. Gemini AI verifies your authentic reasoning and clears the session.',
    icon: Video,
    badge: 'Computer Vision & NLP',
    color: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    step: '04',
    title: 'Soulbound Minting',
    subtitle: 'Permanent On-Chain SBT',
    description:
      'Mint a non-transferable ERC-5192 Soulbound Token to your Ethereum address. Employers verify your score, rubric, and proof on-chain with zero wallet login.',
    icon: Award,
    badge: 'Ethereum ERC-5192',
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verification Protocol
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            How <span className="text-gradient">Certenize</span> Works
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            From free YouTube videos to blockchain-verified credentials in minutes. A fully automated, tamper-proof pipeline powered by AI and Web3.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative group"
              >
                <Card
                  variant="glass"
                  className={`h-full p-6 relative overflow-hidden border ${item.borderColor} hover:border-primary/50 transition-all duration-300 flex flex-col justify-between`}
                >
                  {/* Step Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} border ${item.borderColor} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        <Icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <span className="text-2xl font-black font-display text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-[11px] font-mono text-primary font-medium tracking-wide uppercase">
                        {item.subtitle}
                      </span>
                      <h3 className="text-lg font-bold font-display text-foreground mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Badge footer */}
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {item.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
