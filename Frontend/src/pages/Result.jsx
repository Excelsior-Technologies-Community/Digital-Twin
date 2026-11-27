import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MarketingLayout from '../components/MarketingLayout';
import HeroScene3D from '../components/HeroScene3D';
import StudioPersonaCard3D from '../components/StudioPersonaCard3D';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  UploadCloud,
  FileText,
  User,
  Sliders,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Loader2,
  Cpu,
  Layers,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const INGESTION_STAGES = [
  'Reading Document Vector stream...',
  'Extracting Career Achievements & STAR Metrics...',
  'Generating 3D Spatial Competency Nodes...',
  'Synchronizing Public Recruiter Persona...'
];

const TONE_CALIBRATION_PREVIEWS = {
  Professional:
    'When our API gateway encountered tail-latency spikes under concurrent load, I profiled database read paths and introduced Redis caching alongside composite MySQL indexing. This reduced p99 API latency by 64% across 14 production services while preserving strict transactional consistency.',
  'Direct & Technical':
    'The bottleneck traced to unindexed N+1 joins and redundant serialization on hot endpoints. I added composite B-tree indexes, query batching, and write-through Redis invalidation, cutting p99 API latency by 64% and halving database CPU utilization at peak load.',
  'Confident & Executive':
    'I led the architectural turnaround of our core backend pipeline when latency threatened enterprise SLA renewals. By aligning engineering around targeted caching and index optimization, we reduced p99 API latency by 64% and unlocked reliable scale across 14 clusters.',
  'Friendly & Conversational':
    'That was a great cross-team challenge to solve together. Working closely with our infrastructure engineers, we dug into slow query logs, streamlined our data lookups, and layered in smart caching, bringing p99 API latency down by 64% and keeping everything responsive.'
};

const INGESTION_SPECS = [
  {
    icon: FileText,
    title: 'Format & Payload Limits',
    description:
      'Accepts application/pdf documents up to 10MB. Standard text-selectable vector PDFs exported from Docs, Word, LaTeX, or Figma deliver maximum extraction accuracy over flat scanned image PDFs.',
    pill: 'PDF · MAX 10MB'
  },
  {
    icon: Cpu,
    title: 'Structured Schema Extraction',
    description:
      'Gemini AI automatically normalizes unstructured resume text into structured bio, title, skills[], experience[], education[], and a collision-free /twin/:slug route.',
    pill: 'JSON SCHEMA NORMALIZED'
  },
  {
    icon: Layers,
    title: 'Unified 3-Surface Handoff',
    description:
      'One upload immediately hydrates your interactive 3D WebGL Skill Graph, 24/7 Recruiter Interview Chat, and print-ready A4 Resume Builder without re-entering data.',
    pill: 'GRAPH · CHAT · A4 STUDIO'
  }
];

export default function Result() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const staticScrollRef = useRef(0);
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    name: '',
    tone: 'Professional'
  });

  const [previewTone, setPreviewTone] = useState('Professional');

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (!isSubmitting) {
      setActiveStage(0);
      return;
    }

    setActiveStage(0);
    const t1 = setTimeout(() => setActiveStage(1), 2000);
    const t2 = setTimeout(() => setActiveStage(2), 4800);
    const t3 = setTimeout(() => setActiveStage(3), 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isSubmitting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      const err = 'Please select a valid PDF file (.pdf)';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1048576) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const candidateName = formData.name.trim();
    if (!candidateName) {
      const err = 'Please enter your full name.';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (!file) {
      const err = 'Please upload your PDF resume to initialize your Digital Twin.';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', candidateName);
      submitData.append('tone', formData.tone);
      submitData.append('resumePdf', file);

      const response = await api.post('/twins/create', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success && response.data?.twin) {
        const twinData = response.data.twin;
        localStorage.setItem('activeTwinSlug', twinData.publicSlug || twinData.id);
        if (response.data?.editToken && twinData.publicSlug) {
          try {
            localStorage.setItem(`twinEditToken:${twinData.publicSlug}`, response.data.editToken);
          } catch {}
        }
        toast.success('Digital Twin activated successfully');
        navigate('/digital-twin', { state: { resumeData: twinData } });
      } else {
        throw new Error(response.data?.message || 'Failed to activate twin');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      let errorMessage = 'An error occurred during upload. Please try again.';

      if (error.response && error.response.data) {
        const backendError = error.response.data.error || error.response.data.message;

        if (backendError && typeof backendError === 'string') {
          const lowerErr = backendError.toLowerCase();
          if (lowerErr.includes('text') || lowerErr.includes('parse') || lowerErr.includes('empty')) {
            errorMessage = "We couldn't extract text from this PDF. Please ensure it's a digital text PDF, not a scanned image.";
          } else {
            errorMessage = backendError;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrorMsg(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toneOptions = [
    { label: 'Professional', desc: 'STAR-method, formal & structured' },
    { label: 'Direct & Technical', desc: 'Architecture & code-focused' },
    { label: 'Confident & Executive', desc: 'Strategic outcomes & leadership' },
    { label: 'Friendly & Conversational', desc: 'Collaborative & approachable' }
  ];

  return (
    <MarketingLayout>
      <HeroScene3D scrollProgressRef={staticScrollRef} />

      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto lg:max-w-none grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-stretch">
          <div className="lg:col-span-7 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border border-[#E5E1D8] dark:border-[#334155] shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-5 sm:p-6 lg:p-7 xl:p-8 rounded-2xl relative overflow-hidden flex flex-col h-full min-w-0">
            <div className="shrink-0">
              <div className="inline-flex items-center gap-2 bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155] px-3.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] mb-3 self-start">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Resume-to-AI Parser</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1D2B3A] dark:text-white font-bold tracking-tight mb-2">
                Initialize Your Digital Proxy
              </h1>
              <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed mb-6">
                Upload your PDF resume. Our ingestion engine will automatically extract your achievements, project metrics, and technical expertise to ground your 24/7 AI persona.
              </p>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#B25B3E]/40 flex items-start gap-3 text-xs text-[#B25B3E] dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{errorMsg}</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <label className="font-mono font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2.5 flex items-center gap-1.5 shrink-0">
                <FileText className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                <span>
                  Upload PDF Resume <span className="text-[#B25B3E] dark:text-[#E07A5F]">*</span>
                </span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
                id="resume-pdf-upload"
              />

              <div className="relative flex-1 flex flex-col justify-center min-h-[240px] py-2" style={{ perspective: '1200px' }}>
                <div className="relative flex-1 flex flex-col justify-center" style={{ transformStyle: 'preserve-3d' }}>
                  <div
                    aria-hidden="true"
                    className="absolute inset-1 rounded-2xl bg-[#EAE4DA] dark:bg-[#0B1120] border border-[#E5E1D8] dark:border-[#334155]/70 shadow-sm pointer-events-none transition-transform duration-300 ease-out"
                    style={{
                      transform: shouldReduceMotion
                        ? 'translateZ(-24px) translateY(6px)'
                        : isDragging
                          ? 'translateZ(-24px) translateY(10px) rotate(-1.8deg) scale(0.985)'
                          : file
                            ? 'translateZ(-24px) translateY(8px) rotate(-1deg) scale(0.985)'
                            : 'translateZ(-24px) translateY(5px) rotate(-0.5deg) scale(0.99)'
                    }}
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0.5 rounded-2xl bg-[#F6F2EB] dark:bg-[#131D2E] border border-[#E5E1D8] dark:border-[#334155]/85 shadow-sm pointer-events-none transition-transform duration-300 ease-out"
                    style={{
                      transform: shouldReduceMotion
                        ? 'translateZ(-12px) translateY(3px)'
                        : isDragging
                          ? 'translateZ(-12px) translateY(6px) rotate(1.4deg) scale(0.99)'
                          : file
                            ? 'translateZ(-12px) translateY(4px) rotate(0.8deg) scale(0.99)'
                            : 'translateZ(-12px) translateY(3px) rotate(0.4deg) scale(0.995)'
                    }}
                  />

                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div
                        key="vault-dropzone"
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        aria-label="Upload PDF Resume"
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] min-h-[220px] ${
                          errorMsg && !file
                            ? 'border-red-500 bg-red-50/70 dark:bg-red-950/25'
                            : isDragging
                              ? 'border-[#B25B3E] dark:border-[#E07A5F] bg-[#FFFFFF] dark:bg-[#0F172A] shadow-lg -translate-y-1 ring-2 ring-[#B25B3E]/20 dark:ring-[#E07A5F]/25'
                              : 'border-[#D8D2C5] dark:border-[#334155] bg-[#FFFFFF]/95 dark:bg-[#0F172A]/90 hover:border-[#B25B3E]/60 dark:hover:border-[#E07A5F]/60 hover:bg-[#FCFAF6] dark:hover:bg-[#0F172A] shadow-xs'
                        }`}
                        style={{ transform: 'translateZ(0px)' }}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm transition-colors ${
                            isDragging ? 'border-[#B25B3E] dark:border-[#E07A5F]' : 'border-[#8A847C]/40 dark:border-slate-600'
                          }`}
                        />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm transition-colors ${
                            isDragging ? 'border-[#B25B3E] dark:border-[#E07A5F]' : 'border-[#8A847C]/40 dark:border-slate-600'
                          }`}
                        />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm transition-colors ${
                            isDragging ? 'border-[#B25B3E] dark:border-[#E07A5F]' : 'border-[#8A847C]/40 dark:border-slate-600'
                          }`}
                        />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 rounded-br-sm transition-colors ${
                            isDragging ? 'border-[#B25B3E] dark:border-[#E07A5F]' : 'border-[#8A847C]/40 dark:border-slate-600'
                          }`}
                        />

                        <div
                          className={`relative w-14 h-14 rounded-2xl bg-[#F3EFE9] dark:bg-[#1E293B] border flex items-center justify-center mx-auto mb-3.5 shadow-sm transition-all duration-200 shrink-0 ${
                            isDragging
                              ? 'border-[#B25B3E] dark:border-[#E07A5F] -translate-y-1 scale-105'
                              : 'border-[#E5E1D8] dark:border-[#334155]'
                          }`}
                        >
                          <UploadCloud className="w-6 h-6 text-[#B25B3E] dark:text-[#E07A5F]" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#1D2B3A] dark:bg-[#B25B3E] text-white flex items-center justify-center shadow-xs">
                            <FileText className="w-3 h-3" />
                          </div>
                        </div>

                        <h3 className="text-sm sm:text-base font-serif font-bold text-[#1D2B3A] dark:text-white mb-1">
                          {isDragging ? 'Release to Lock PDF Buffer' : 'Click to upload your PDF Resume'}
                        </h3>
                        <p className="text-xs text-[#5C5751] dark:text-slate-400 max-w-sm mx-auto mb-4">
                          {isDragging
                            ? 'Drop document into the archival ingestion vault'
                            : 'Drag and drop your document here, or browse from your device'}
                        </p>
                        <span className="inline-block text-[10px] font-mono font-semibold uppercase tracking-widest text-[#5C5751] dark:text-slate-300 bg-[#F3EFE9] dark:bg-[#1E293B] px-3 py-1 rounded-md border border-[#E5E1D8] dark:border-[#334155]">
                          PDF ONLY &middot; MAX 10MB
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="vault-locked"
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.985 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="relative flex-1 flex flex-col justify-center bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-5 sm:p-6 shadow-md overflow-hidden min-h-[220px]"
                        style={{ transform: 'translateZ(0px)' }}
                      >
                        <AnimatePresence>
                          {isSubmitting && !shouldReduceMotion && (
                            <motion.div
                              key="vault-laser-scan"
                              initial={{ y: '0%', opacity: 0 }}
                              animate={{ y: ['0%', '88%', '0%'], opacity: [0.95, 0.95, 0.95] }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
                              className="pointer-events-none absolute inset-0 z-20 will-change-transform"
                              aria-hidden="true"
                            >
                              <div className="h-[2px] w-full bg-[#B25B3E] dark:bg-[#E07A5F] shadow-[0_0_16px_4px_rgba(178,91,62,0.75)] dark:shadow-[0_0_18px_4px_rgba(224,122,95,0.85)]" />
                              <div className="h-10 w-full bg-gradient-to-b from-[#B25B3E]/20 dark:from-[#E07A5F]/25 to-transparent" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-11 h-11 rounded-xl bg-[#1D2B3A] dark:bg-[#B25B3E] flex items-center justify-center text-[#FCFAF6] shrink-0 shadow-xs">
                              <FileCheck className="w-5 h-5 text-[#FCFAF6]" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-[#10B981] border border-emerald-200 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                <span>PDF BUFFER VERIFIED</span>
                              </span>
                              <h4 className="text-sm sm:text-base font-serif font-bold text-[#1D2B3A] dark:text-white break-words">
                                {file.name}
                              </h4>
                              <p className="text-xs font-mono text-[#5C5751] dark:text-slate-400">
                                {formatFileSize(file.size)} &middot; Ready for semantic synthesis
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isSubmitting}
                              aria-label="Change uploaded resume"
                              className="text-xs font-sans font-semibold text-[#1D2B3A] dark:text-slate-100 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] px-3.5 py-2 min-h-[44px] bg-[#F3EFE9] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-xl transition-colors shadow-2xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              disabled={isSubmitting}
                              aria-label="Remove uploaded file"
                              className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#5C5751] dark:text-slate-400 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] bg-[#F3EFE9]/60 dark:bg-[#1E293B] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] border border-[#E5E1D8] dark:border-[#334155] transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence>
                {isSubmitting && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="bg-[#F3EFE9]/80 dark:bg-[#0F172A]/80 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F]">
                          Ingestion Progress
                        </span>
                        <span className="font-mono text-[10px] text-[#5C5751] dark:text-slate-400">
                          Stage {activeStage + 1} of {INGESTION_STAGES.length}
                        </span>
                      </div>

                      <div className="h-1.5 w-full bg-[#E5E1D8] dark:bg-[#334155] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#B25B3E] dark:bg-[#E07A5F] rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${((activeStage + 1) / INGESTION_STAGES.length) * 100}%` }}
                          transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        {INGESTION_STAGES.map((stageText, idx) => {
                          const isCompleted = idx < activeStage;
                          const isActive = idx === activeStage;

                          return (
                            <div key={idx} className="flex items-center gap-2.5 text-xs transition-colors">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                              ) : isActive ? (
                                <Loader2 className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0 animate-spin" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-[#E5E1D8] dark:border-[#334155] flex items-center justify-center shrink-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C5751]/40 dark:bg-slate-600" />
                                </span>
                              )}
                              <span
                                className={
                                  isActive
                                    ? 'font-semibold text-[#1D2B3A] dark:text-white'
                                    : isCompleted
                                    ? 'font-medium text-[#1D2B3A] dark:text-slate-200'
                                    : 'text-[#5C5751]/60 dark:text-slate-500'
                                }
                              >
                                {stageText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-auto pt-4 border-t border-[#E5E1D8] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#5C5751] dark:text-slate-400 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                <span>AI-Grounded Executive Synthesis</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-medium text-[11px] text-[#047857] dark:text-[#10B981] shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#047857] dark:bg-[#10B981] animate-pulse motion-reduce:animate-none shrink-0" />
                <span>Semantic Extraction Ready</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border border-[#E5E1D8] dark:border-[#334155] shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-5 sm:p-6 lg:p-7 rounded-2xl relative overflow-hidden flex flex-col h-full min-w-0">
            <StudioPersonaCard3D
              name={formData.name}
              tone={formData.tone}
              file={file}
              isSubmitting={isSubmitting}
            />

            <div className="space-y-5 shrink-0">
              <div>
                <label
                  htmlFor="name"
                  className="font-mono font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                  <span>
                    Full Candidate Name <span className="text-[#B25B3E] dark:text-[#E07A5F]">*</span>
                  </span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Manav Patel"
                  disabled={isSubmitting}
                  required
                  aria-invalid={!!(errorMsg && !formData.name.trim())}
                  className={`w-full rounded-xl px-4 py-3 text-sm sm:text-base font-sans transition-all outline-none ${
                    errorMsg && !formData.name.trim()
                      ? 'border border-red-500 bg-red-50/60 dark:bg-red-950/20 text-red-900 dark:text-red-100 focus:ring-2 focus:ring-red-500/20'
                      : 'bg-[#FCFAF6] dark:bg-[#0F172A]/80 border border-[#E5E1D8] dark:border-[#334155] text-[#1D2B3A] dark:text-white placeholder-[#5C5751]/50 dark:placeholder-slate-400/60 focus:border-[#B25B3E] focus:ring-2 focus:ring-[#B25B3E]/20'
                  }`}
                />
              </div>

              <div>
                <label className="font-mono font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                  <span>Speaking Persona Tone</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
                  {toneOptions.map((tone) => {
                    const isSelected = formData.tone === tone.label;
                    return (
                      <button
                        key={tone.label}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, tone: tone.label }));
                          setPreviewTone(tone.label);
                        }}
                        aria-pressed={isSelected}
                        className={`min-w-0 text-left p-3 rounded-xl border transition-all duration-200 text-xs h-full flex flex-col justify-between min-h-[72px] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
                          isSelected
                            ? 'bg-[#1D2B3A] dark:bg-[#0F172A] text-[#FCFAF6] dark:text-white border-[#B25B3E] dark:border-[#E07A5F] ring-1 ring-[#B25B3E]/30 dark:ring-[#E07A5F]/30 shadow-sm'
                            : 'bg-[#F3EFE9]/80 dark:bg-[#0F172A]/50 text-[#1D2B3A] dark:text-slate-100 border-[#E5E1D8] dark:border-[#334155] hover:border-[#B25B3E]/40 dark:hover:border-[#E07A5F]/40 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="font-serif font-bold text-xs sm:text-sm mb-1 flex items-center justify-between gap-2 w-full min-w-0">
                          <span className="min-w-0 break-words">{tone.label}</span>
                          {isSelected ? (
                            <span
                              aria-hidden="true"
                              className="w-2 h-2 rounded-full bg-[#B25B3E] dark:bg-[#E07A5F] shrink-0"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="w-1.5 h-1.5 rounded-full bg-[#E5E1D8] dark:bg-[#334155] shrink-0"
                            />
                          )}
                        </div>
                        <span
                          className={
                            isSelected
                              ? 'text-[#FCFAF6]/75 dark:text-slate-300 text-[11px] leading-snug'
                              : 'text-[#5C5751] dark:text-slate-400 text-[11px] leading-snug'
                          }
                        >
                          {tone.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-5 shrink-0">
              <button
                id="activate-twin-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#B25B3E] hover:bg-[#9E4D32] text-white font-semibold font-sans py-3.5 sm:py-4 min-h-[48px] rounded-xl transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Twin...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Digital Twin</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-[#E5E1D8]/80 dark:border-[#334155]/80 space-y-14 sm:space-y-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
                TONE CALIBRATION PREVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight">
                Hear How Your Digital Twin Answers
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed">
                Preview how each speaking posture shapes the delivery of the same verified resume metric without altering factual accuracy.
              </p>
            </div>

            <div className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {toneOptions.map((tone) => {
                const isPreviewActive = previewTone === tone.label;
                return (
                  <button
                    key={tone.label}
                    type="button"
                    onClick={() => setPreviewTone(tone.label)}
                    aria-pressed={isPreviewActive}
                    className={`shrink-0 min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-sans font-semibold border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                      isPreviewActive
                        ? 'bg-[#B25B3E] text-white border-[#B25B3E] shadow-xs'
                        : 'bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 text-[#5C5751] dark:text-slate-300 border-[#E5E1D8] dark:border-[#334155] hover:text-[#1D2B3A] dark:hover:text-white hover:border-[#B25B3E]/40 dark:hover:border-[#E07A5F]/40'
                    }`}
                  >
                    {tone.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E1D8] dark:border-[#334155]">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block">
                      RECRUITER INQUIRY
                    </span>
                    <p className="text-sm sm:text-base font-serif font-semibold text-[#1D2B3A] dark:text-white mt-0.5">
                      &ldquo;Tell me about a time you solved a major backend bottleneck.&rdquo;
                    </p>
                  </div>
                </div>

                {previewTone === formData.tone ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-[#10B981] border border-emerald-200 dark:border-emerald-800/60 shrink-0 self-start sm:self-center">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Active in Workbench</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, tone: previewTone }));
                      toast.success(`Speaking tone set to ${previewTone}`);
                    }}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-[#B25B3E] hover:bg-[#9E4D32] text-white shadow-xs transition-all active:scale-[0.98] shrink-0 self-start sm:self-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                  >
                    <span>Apply to Workbench</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                  </button>
                )}
              </div>

              <div className="min-h-[88px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={previewTone}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="text-sm sm:text-base text-[#1D2B3A] dark:text-slate-200 leading-relaxed"
                  >
                    {TONE_CALIBRATION_PREVIEWS[previewTone]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="pt-4 border-t border-[#E5E1D8]/80 dark:border-[#334155]/80 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-slate-300 border border-[#E5E1D8] dark:border-[#334155]">
                  STAR-METHOD FRAMING
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#047857] dark:text-[#10B981] border border-[#E5E1D8] dark:border-[#334155]">
                  SAME VERIFIED METRIC
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155]">
                  TONE: {previewTone.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
                INGESTION SPECIFICATIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight">
                Built for Clean Semantic Parsing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {INGESTION_SPECS.map((spec, idx) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={spec.title}
                    className={`bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 ${
                      idx === 2 ? 'md:col-span-2 lg:col-span-1' : ''
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] flex items-center justify-center border border-[#E5E1D8] dark:border-[#334155] mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#1D2B3A] dark:text-white">
                        {spec.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed mt-2.5">
                        {spec.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#E5E1D8]/80 dark:border-[#334155]/80">
                      <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F]">
                        {spec.pill}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-[#1D2B3A] dark:bg-[#1E293B] text-white border border-[#1D2B3A] dark:border-[#334155] p-5 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none shrink-0" />
                <span>PRIVACY &amp; GROUNDING GUARANTEE</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-tight">
                In-Memory PDF Buffers. Strictly Fact-Bound AI.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Uploaded resumes are streamed strictly through in-memory buffers (multer.memoryStorage) for text extraction. Raw binary PDF files are never persisted on disk, and all conversational answers stay anchored to your verified resume content.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' })}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs sm:text-sm font-sans font-semibold transition-all active:scale-[0.98] shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]"
            >
              <ArrowUp className="w-4 h-4 text-[#E07A5F] shrink-0" />
              <span>Back to Upload Workbench</span>
            </button>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}