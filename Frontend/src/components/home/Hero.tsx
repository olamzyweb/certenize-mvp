import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import {
  ArrowRight,
  Award,
  Sparkles,
  Youtube,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cpu,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { HeroCredentialCard } from './HeroCredentialCard';

export function Hero() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      navigate(`/quiz?search=${encodeURIComponent(quickInput.trim())}`);
    } else {
      navigate('/quiz');
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
      {/* Background Ambience & Glowing Gradients */}
      <div className="absolute inset-0 pattern-grid opacity-35 pointer-events-none" />
      <div className="absolute top-1/4 left-1/12 w-[550px] h-[550px] bg-primary/8 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/12 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse-slow animation-delay-1000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            {/* Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-primary/25 shadow-lg text-xs font-medium"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-foreground/90 font-semibold tracking-wide">
                Next-Gen Decentralized Skill Credentialing
              </span>
              <span className="hidden sm:inline-block text-muted-foreground font-mono text-[11px] border-l border-border/80 pl-2">
                ERC-5192 Soulbound
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold font-display leading-[1.08] tracking-tight"
            >
              Turn Open Knowledge into{' '}
              <span className="text-gradient">On-Chain Proof</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Paste any YouTube course or tech topic. Certenize’s Multi-LLM AI generates open-ended
              technical scenario exams, monitors proctoring integrity, and mints permanent,
              non-transferable Soulbound Tokens on Ethereum.
            </motion.p>

            {/* Quick Launch Input Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              onSubmit={handleQuickLaunch}
              className="relative max-w-xl mx-auto lg:mx-0"
            >
              <div className="relative flex items-center p-1.5 rounded-2xl glass-card border border-primary/30 shadow-2xl focus-within:border-primary transition-all">
                <div className="pl-3.5 pr-2 text-muted-foreground">
                  <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                </div>
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Paste YouTube course URL or topic (e.g. Solidity, Next.js)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2.5 px-1"
                />
                <Button
                  type="submit"
                  variant="hero"
                  size="md"
                  className="shrink-0 rounded-xl font-medium shadow-md group"
                >
                  <span>Test Skills</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.form>

            {/* Wallet Connect & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1"
            >
              {isConnected ? (
                <>
                  <Link to="/quiz">
                    <Button variant="hero" size="xl" className="group shadow-xl">
                      <Sparkles className="w-5 h-5 mr-2 text-primary-foreground" />
                      Start Assessment
                      <ArrowRight className="w-5 h-5 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/gallery">
                    <Button variant="hero-outline" size="xl">
                      <Award className="w-5 h-5 mr-2" />
                      Verify Credentials
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <ConnectButton />
                  <Link to="/gallery" className="w-full sm:w-auto">
                    <Button variant="hero-outline" size="md" className="w-full">
                      <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                      Recruiter Explorer (Zero Wallet)
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Quick Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 max-w-xl mx-auto lg:mx-0"
            >
              {[
                {
                  label: 'Non-Transferable',
                  val: 'ERC-5192',
                  icon: Lock,
                  color: 'text-emerald-400',
                },
                {
                  label: 'Recruiter Verification',
                  val: 'Instant (0.1s)',
                  icon: Zap,
                  color: 'text-cyan-400',
                },
                {
                  label: 'Cost per Test',
                  val: '~₦15 ($0.01)',
                  icon: Cpu,
                  color: 'text-amber-400',
                },
              ].map((item, idx) => (
                <div key={idx} className="text-left">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-display text-foreground mt-0.5">
                    {item.val}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Interactive Holographic Credential Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <HeroCredentialCard />
          </motion.div>
        </div>
      </div>

      {/* Subtle Bottom Gradient Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
    </section>
  );
}
