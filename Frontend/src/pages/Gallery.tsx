import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2, Inbox, Search, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CertificateCard } from '@/components/certificates/CertificateCard';
import { CredentialInspectionModal } from '@/components/certificates/CredentialInspectionModal';
import { getCredentials } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Certificate } from '@/types';
import { Helmet } from 'react-helmet-async';

const Gallery = () => {
  const VITE_APP_NAME = import.meta.env.VITE_APP_NAME || 'Certenize';
  const { address: connectedAddress } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlWallet = searchParams.get('wallet') || '';
  const [searchInput, setSearchInput] = useState(urlWallet);
  const [activeLookupAddress, setActiveLookupAddress] = useState(urlWallet || connectedAddress || '');

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Sync with wallet or URL changes
  useEffect(() => {
    if (urlWallet) {
      setActiveLookupAddress(urlWallet);
      setSearchInput(urlWallet);
    } else if (connectedAddress && !activeLookupAddress) {
      setActiveLookupAddress(connectedAddress);
      setSearchInput(connectedAddress);
    }
  }, [urlWallet, connectedAddress, activeLookupAddress]);

  // Fetch certificates whenever activeLookupAddress changes
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!activeLookupAddress) {
        setCertificates([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getCredentials(activeLookupAddress);
        if (response.success && response.data) {
          setCertificates(response.data);
        } else {
          setCertificates([]);
        }
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [activeLookupAddress]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;
    setActiveLookupAddress(clean);
    setSearchParams({ wallet: clean });
  };

  const isEmployerLookup = Boolean(
    activeLookupAddress &&
    connectedAddress &&
    activeLookupAddress.toLowerCase() !== connectedAddress.toLowerCase()
  ) || (!connectedAddress && Boolean(activeLookupAddress));

  return (
    <>
      {/* Helmet for SEO */}
      <Helmet>
        <title>Employer & Candidate Credential Verification | {VITE_APP_NAME}</title>
        <meta
          name="description"
          content="Verify Soulbound Tokens and AI-assessed skill credentials on the blockchain."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Decentralized Skill Verifier</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">
                Credential Verification & Gallery
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Instant on-chain verification for employers and learners. Every Soulbound Token (SBT) is non-transferable and permanently recorded.
              </p>
            </motion.div>

            {/* Employer Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mb-10"
            >
              <Card className="p-3 border border-border bg-card/70 backdrop-blur-md shadow-lg">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="employer-wallet-search"
                      placeholder="Paste candidate wallet address (0x...)"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-9 text-sm font-mono"
                    />
                  </div>
                  <Button type="submit" variant="hero" disabled={!searchInput.trim() || loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
                    Verify Candidate
                  </Button>
                </form>
              </Card>

              {/* Employer verification indicator banner */}
              {isEmployerLookup && activeLookupAddress && (
                <div className="mt-3 text-xs text-center text-primary bg-primary/10 border border-primary/20 rounded-xl py-2 px-4 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>
                    Viewing public credential proof for candidate: <strong className="font-mono">{activeLookupAddress.slice(0, 8)}...{activeLookupAddress.slice(-6)}</strong>
                  </span>
                </div>
              )}
            </motion.div>

            {/* Content Area */}
            {!activeLookupAddress ? (
              /* State: No wallet connected and no search made */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 max-w-md mx-auto"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-secondary/80 border border-border flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold font-display mb-2">
                  Public Employer Lookup
                </h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Enter a candidate's Ethereum wallet address above to inspect their verified credentials, or connect your wallet to view your personal certificates.
                </p>
              </motion.div>
            ) : loading ? (
              /* State: Loading */
              <div className="flex items-center justify-center py-24">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">Querying blockchain credentials...</p>
                </motion.div>
              </div>
            ) : certificates.length === 0 ? (
              /* State: Empty Results */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
                  <Inbox className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold font-display mb-2">
                  No Credentials Found
                </h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  No Soulbound Tokens have been minted to this address yet.
                </p>
                <a href="/quiz">
                  <Button variant="hero">
                    Take an Assessment
                  </Button>
                </a>
              </motion.div>
            ) : (
              /* State: Credentials Grid */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {certificates.map((certificate, index) => (
                  <motion.div
                    key={certificate.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <CertificateCard
                      certificate={certificate}
                      onClick={() => setSelectedCert(certificate)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Stats Summary */}
            {certificates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { label: 'Verified Certificates', value: certificates.length },
                  {
                    label: 'Average Score',
                    value: `${Math.round(
                      certificates.reduce((acc, c) => acc + (c.score || 0), 0) / certificates.length
                    )}%`,
                  },
                  { label: 'Unique Skill Tracks', value: new Set(certificates.map((c) => c.topic)).size },
                  { label: 'Blockchain Status', value: 'Immutable SBT' },
                ].map((stat, index) => (
                  <div key={index} className="glass-card p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold font-display text-gradient">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </main>

        {/* ─── Recruiter Credential Inspection Modal ─────────────────── */}
        <CredentialInspectionModal
          certificate={selectedCert}
          isOpen={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
        />
      </div>
    </>
  );
};

export default Gallery;

