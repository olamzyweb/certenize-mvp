import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Features } from '@/components/home/Features';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award, ShieldCheck, Github, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const VITE_APP_NAME = import.meta.env.VITE_APP_NAME || 'Certenize';
  const { isConnected } = useAccount();

  return (
    <>
      {/* Helmet for SEO */}
      <Helmet>
        <title>Home | {VITE_APP_NAME} - Decentralized AI Skill Credentialing</title>
        <meta
          name="description"
          content={`${VITE_APP_NAME} - Convert open YouTube courses and knowledge into blockchain-verified Soulbound Token (SBT) credentials via generative AI examination.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          {/* 1. Hero with Interactive Credential Preview */}
          <Hero />

          {/* 2. Verification Protocol Pipeline */}
          <HowItWorks />

          {/* 3. Core Tech Pillars & Comparison Matrix */}
          <Features />

          {/* 4. High-Impact CTA Section */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 sm:p-14 rounded-3xl text-center max-w-4xl mx-auto border border-primary/25 shadow-2xl relative overflow-hidden"
              >
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Decentralized Meritocracy
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-4 tracking-tight">
                  Ready to Turn Your Learning into{' '}
                  <span className="text-gradient">Verifiable On-Chain Proof?</span>
                </h2>

                <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
                  No subscriptions, no gatekeepers. Paste any YouTube video course link or skill topic to generate your AI scenario examination, prove your mastery, and mint your Soulbound Token on Ethereum.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/quiz">
                    <Button variant="hero" size="xl" className="group shadow-2xl w-full sm:w-auto">
                      <Sparkles className="w-5 h-5 mr-2 text-primary-foreground" />
                      Start Free Assessment
                      <ArrowRight className="w-5 h-5 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <Link to="/gallery">
                    <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                      <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" />
                      Explore Public Verifier
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* 5. Modern Web3 Footer */}
          <footer className="border-t border-border/80 py-12 bg-card/40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 flex items-center justify-center">
                    <span className="text-base font-bold font-display text-gradient">C</span>
                  </div>
                  <div>
                    <span className="font-bold font-display text-foreground">{VITE_APP_NAME}</span>
                    <p className="text-[11px] text-muted-foreground">
                      Decentralized AI Skill Credential Protocol
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <Link to="/quiz" className="hover:text-foreground transition-colors">
                    Take Assessment
                  </Link>
                  <Link to="/gallery" className="hover:text-foreground transition-colors">
                    Recruiter Explorer
                  </Link>
                  <Link to="/mint" className="hover:text-foreground transition-colors">
                    Mint SBT
                  </Link>
                </div>

                <div className="text-xs text-muted-foreground text-center md:text-right font-mono">
                  <p className="text-[11px]">&copy; {new Date().getFullYear()} {VITE_APP_NAME}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Home;
