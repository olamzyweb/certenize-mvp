import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Mic,
  Camera,
  Square,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { submitAppeal } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface VideoAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  topic: string;
  onVerified: (mintToken: string, feedback: string) => void;
}

export const VideoAppealModal: React.FC<VideoAppealModalProps> = ({
  isOpen,
  onClose,
  quizId,
  topic,
  onVerified,
}) => {
  const { toast } = useToast();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [appealExplanation, setAppealExplanation] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    feedback: string;
  } | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Initialize Camera Stream ──────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setPermissionError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      setStream(mediaStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setPermissionError(
        err.message || 'Unable to access camera and microphone. Please ensure permissions are granted.'
      );
    }
  }, []);

  // ─── Stop Camera Stream ────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setRecordedBlob(null);
      setIsRecording(false);
      setTimeLeft(60);
      setVerificationResult(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, startCamera, stopCamera]);

  // Keep preview attached when stream updates
  useEffect(() => {
    if (videoPreviewRef.current && stream && !recordedBlob) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream, recordedBlob]);

  // ─── Start Recording ───────────────────────────────────────────────────────
  const startRecording = () => {
    if (!stream) {
      // If camera unavailable, simulate recording timer for demo mode
      setIsRecording(true);
      setTimeLeft(60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
    }

    chunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };

      recorder.start(500);
      setIsRecording(true);
      setTimeLeft(60);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      toast({
        title: 'Recording Error',
        description: 'Could not initialize video recorder. You can still submit an explanation.',
        variant: 'destructive',
      });
    }
  };

  // ─── Stop Recording ────────────────────────────────────────────────────────
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!recordedBlob) {
      // Demo mock blob if no stream
      const mockBlob = new Blob(['mock video data'], { type: 'video/webm' });
      setRecordedBlob(mockBlob);
      setPreviewUrl('mock');
    }
  };

  // ─── Reset / Re-record ─────────────────────────────────────────────────────
  const handleReset = () => {
    if (previewUrl && previewUrl !== 'mock') {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRecordedBlob(null);
    setTimeLeft(60);
    setVerificationResult(null);
    startCamera();
  };

  // ─── Submit Appeal ─────────────────────────────────────────────────────────
  const handleSubmitAppeal = async () => {
    setIsAnalyzing(true);
    try {
      const response = await submitAppeal(
        quizId,
        recordedBlob || undefined,
        appealExplanation || `Video verification for ${topic} assessment.`
      );

      if (response.success && response.data?.verified) {
        const token = response.data.mintToken || `mint-${Date.now()}`;
        const feedback =
          response.data.feedback ||
          'Video explanation verified. Authenticity confirmed and minting unlocked!';

        setVerificationResult({ verified: true, feedback });
        toast({
          title: 'Appeal Approved! 🎉',
          description: 'Your video explanation has been verified by Gemini AI.',
        });

        setTimeout(() => {
          onVerified(token, feedback);
          onClose();
        }, 2200);
      } else {
        const feedback =
          response.data?.feedback ||
          'Verification could not validate subject comprehension. Please retake the test.';
        setVerificationResult({ verified: false, feedback });
        toast({
          title: 'Review Complete',
          description: feedback,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Submission Error',
        description: err.message || 'Failed to submit video appeal.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <Card variant="glass" className="relative p-6 sm:p-8 border border-primary/30 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                    Proof of Understanding <ShieldCheck className="w-4 h-4 text-primary" />
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Record a 60-second video explanation on <span className="text-primary font-medium">{topic}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isAnalyzing}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport Area */}
            <div className="mt-5 space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/80 border border-border flex items-center justify-center">
                {/* 1. Live Camera Stream */}
                {!previewUrl && (
                  <>
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {permissionError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/90">
                        <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-foreground font-medium mb-1">Camera Access Required</p>
                        <p className="text-xs text-muted-foreground mb-4 max-w-sm">{permissionError}</p>
                        <Button variant="hero-outline" size="sm" onClick={startCamera}>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Camera
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* 2. Recorded Video Playback */}
                {previewUrl && (
                  <>
                    {previewUrl === 'mock' ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <CheckCircle className="w-12 h-12 text-success mb-2" />
                        <p className="text-sm font-medium text-foreground">Video Proof Recorded (60s)</p>
                        <p className="text-xs text-muted-foreground mt-1">Ready for Gemini AI authenticity verification.</p>
                      </div>
                    ) : (
                      <video
                        ref={playbackRef}
                        src={previewUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    )}
                  </>
                )}

                {/* Recording Live Indicator Overlay */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-semibold backdrop-blur-md shadow-lg animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    REC &bull; 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </div>
                )}

                {/* Top Tips Overlay when ready */}
                {!isRecording && !previewUrl && !permissionError && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-2.5 text-xs text-foreground/90 border border-white/10 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>Explain your architecture choices and how you solved the scenario questions.</span>
                  </div>
                )}
              </div>

              {/* Spoken Summary / Explanation text box */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Key notes / verbal explanation summary (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Walked through contract state updates, reentrancy guards, and scaling tests..."
                  value={appealExplanation}
                  onChange={(e) => setAppealExplanation(e.target.value)}
                  disabled={isAnalyzing || !!verificationResult}
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* AI Verification Results Callout */}
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    verificationResult.verified
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-destructive/10 border-destructive/30 text-destructive'
                  }`}
                >
                  {verificationResult.verified ? (
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-sm mb-1">
                      {verificationResult.verified ? 'AI Verification Passed' : 'Verification Unsuccessful'}
                    </p>
                    <p className="text-foreground/90">{verificationResult.feedback}</p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-muted-foreground">
                  {!previewUrl ? 'Max duration: 60 seconds' : 'Playback preview active'}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!recordedBlob ? (
                    !isRecording ? (
                      <Button
                        variant="hero"
                        size="md"
                        onClick={startRecording}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="md"
                        onClick={stopRecording}
                        className="w-full sm:w-auto"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recording
                      </Button>
                    )
                  ) : (
                    <>
                      <Button
                        variant="hero-outline"
                        size="md"
                        onClick={handleReset}
                        disabled={isAnalyzing || !!verificationResult?.verified}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-record
                      </Button>

                      <Button
                        variant="hero"
                        size="md"
                        onClick={handleSubmitAppeal}
                        disabled={isAnalyzing || !!verificationResult?.verified}
                        className="w-full sm:w-auto"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            Verifying with Gemini AI…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Submit for AI Verification
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
