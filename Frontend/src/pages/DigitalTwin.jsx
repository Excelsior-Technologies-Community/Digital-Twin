import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';
import MarketingLayout from '../components/MarketingLayout';
import { useToast } from '../context/ToastContext';

const SkillGraph3D = React.lazy(() => import('../components/SkillGraph3D'));

import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Bot,
  UploadCloud,
  ShieldCheck,
  Zap,
  Radio,
  User,
  UserCheck,
  FileText,
  Sliders,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Clock,
  PanelRightClose,
  PanelRightOpen,
  Link2,
  Activity,
  Layers,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  QrCode,
  Download,
  Search,
  X
} from 'lucide-react';

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
};

const parseVerifiedSkills = (rawSkills) => {
  let candidateList = parseJsonArray(rawSkills);
  if (candidateList.length === 0 && typeof rawSkills === 'string') {
    const trimmed = rawSkills.trim();
    if (trimmed && !trimmed.startsWith('[')) {
      candidateList = trimmed.split(',');
    }
  }

  const seenLower = new Set();
  const normalized = [];
  for (const entry of candidateList) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (seenLower.has(lower)) continue;
    seenLower.add(lower);
    normalized.push(trimmed);
  }
  return normalized;
};

export default function DigitalTwin() {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const stateResumeData = location.state?.resumeData;

  const [twinProfile, setTwinProfile] = useState(stateResumeData || null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(!stateResumeData);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const qrWrapperRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isQrModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsQrModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isQrModalOpen]);

  const fetchAnalytics = async (targetId) => {
    const idToUse = targetId || twinProfile?.resumeId || twinProfile?.publicSlug;
    if (!idToUse) return;
    setIsLoadingHistory(true);
    try {
      const res = await api.get(`/twins/analytics/${idToUse}`);
      if (res.data?.success) {
        setChatHistory(res.data.conversations || res.data.analytics || []);
      }
    } catch (err) {
      console.warn('Could not load chat history:', err.message);
      toast.error('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTwinProfile = async () => {
      if (stateResumeData) {
        setTwinProfile(stateResumeData);
        localStorage.setItem('activeTwinSlug', stateResumeData.publicSlug || stateResumeData.id);
        setIsLoading(false);
        fetchAnalytics(stateResumeData.resumeId || stateResumeData.publicSlug || stateResumeData.id);
        return;
      }

      const storedSlug = localStorage.getItem('activeTwinSlug');
      if (storedSlug) {
        setIsLoading(true);
        setError(null);
        try {
          const res = await api.get(`/twins/${storedSlug}`);
          if (isMounted && res.data?.success && res.data?.twin) {
            const profile = res.data.twin;
            setTwinProfile(profile);
            fetchAnalytics(profile.resumeId || profile.publicSlug || profile.id);
          } else {
            throw new Error('Digital Twin profile not found');
          }
        } catch (err) {
          console.error('Error fetching stored twin profile:', err);
          if (isMounted) {
            setError(err.response?.data?.message || 'Unable to load your saved Digital Twin profile.');
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setError('No active Digital Twin found. Please upload a PDF resume to initialize your persona.');
        setIsLoading(false);
      }
    };

    loadTwinProfile();

    return () => {
      isMounted = false;
    };
  }, [stateResumeData]);

  const publicLink =
    twinProfile?.publicSlug || twinProfile?.slug
      ? `${window.location.origin}/twin/${twinProfile.publicSlug || twinProfile.slug}`
      : 'Generating public twin link...';

  const handleCopyLink = async () => {
    if (!twinProfile?.publicSlug && !twinProfile?.slug) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      toast.success('Share link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link to clipboard');
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'DT';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const resolvedSlug = twinProfile?.publicSlug || twinProfile?.slug;

  const handleDownloadQr = () => {
    if (!resolvedSlug || !qrWrapperRef.current) return;
    const canvas = qrWrapperRef.current.querySelector('canvas');
    if (!canvas) {
      toast.error('QR code canvas is not ready yet.');
      return;
    }
    try {
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${resolvedSlug}-digital-twin-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code PNG downloaded');
    } catch {
      toast.error('Unable to export QR image.');
    }
  };

  const filteredChatHistory = useMemo(() => {
    const query = activitySearch.trim().toLowerCase();
    if (!query) return chatHistory;
    return chatHistory.filter((item) => {
      const visitor = String(item?.visitorName || 'Anonymous Recruiter').toLowerCase();
      const question = String(item?.question || '').toLowerCase();
      const aiResponse = String(item?.aiResponse || '').toLowerCase();
      return (
        visitor.includes(query) ||
        question.includes(query) ||
        aiResponse.includes(query)
      );
    });
  }, [chatHistory, activitySearch]);

  const verifiedSkills = useMemo(
    () => parseVerifiedSkills(twinProfile?.skills),
    [twinProfile?.skills]
  );

  const verifiedExperience = useMemo(
    () => parseJsonArray(twinProfile?.experience).filter((item) => item && typeof item === 'object'),
    [twinProfile?.experience]
  );

  const verifiedEducation = useMemo(
    () => parseJsonArray(twinProfile?.education).filter((item) => item && typeof item === 'object'),
    [twinProfile?.education]
  );

  const hasContactDetails = Boolean(twinProfile?.email?.trim() || twinProfile?.phone?.trim());

  return (
    <MarketingLayout>
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 font-sans">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-[#E5E1D8] dark:border-[#334155] border-t-[#B25B3E] animate-spin" />
              <Bot className="w-6 h-6 text-[#1D2B3A] dark:text-slate-100 absolute inset-0 m-auto" />
            </div>
            <p className="text-[#1D2B3A] dark:text-white font-serif font-semibold">
              Initializing your Digital Twin workspace...
            </p>
            <p className="text-xs text-[#5C5751] dark:text-slate-400">
              Syncing resume embeddings and persona parameters
            </p>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E]/40 dark:border-[#E07A5F]/50 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-md my-10">
            <AlertCircle className="w-10 h-10 text-[#B25B3E] dark:text-[#E07A5F] mx-auto" />
            <h1 className="text-xl font-serif font-bold text-[#1D2B3A] dark:text-white">
              Digital Twin Profile
            </h1>
            <p className="text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed">{error}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/studio')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-semibold rounded-xl shadow-xs transition-all duration-150 ease-out active:scale-[0.98] min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resume</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 text-xs font-semibold rounded-xl border border-[#E5E1D8] dark:border-[#334155] shadow-2xs transition-all min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 shadow-sm transition-colors">
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#1D2B3A] dark:bg-[#B25B3E] text-white font-serif font-semibold flex items-center justify-center shrink-0 shadow-xs select-none">
                  {getInitials(twinProfile?.name)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A847C] dark:text-slate-400">
                      DIGITAL TWIN COMMAND CENTER
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-[#10B981] border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#047857] dark:bg-[#10B981] animate-pulse" />
                      <span>LIVE PROXY</span>
                    </span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D2B3A] dark:text-white leading-tight truncate">
                    {twinProfile?.name || 'Digital Twin'}
                  </h1>

                  {twinProfile?.title && (
                    <p className="text-sm text-[#5C5751] dark:text-slate-300 font-medium truncate">
                      {twinProfile.title}
                    </p>
                  )}

                  <p className="font-mono text-xs text-[#B25B3E] dark:text-[#E07A5F] truncate">
                    {resolvedSlug ? `/twin/${resolvedSlug}` : 'Generating public twin link...'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/studio')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 text-xs font-semibold rounded-xl border border-[#E5E1D8] dark:border-[#334155] shadow-2xs transition-all active:scale-[0.98] min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                  <span>New Upload</span>
                </button>

                {resolvedSlug && (
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    aria-label="Open QR share modal"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#FCFAF6] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 text-xs font-semibold rounded-xl transition-all duration-150 ease-out active:scale-[0.98] border border-[#E5E1D8] dark:border-[#334155] shadow-2xs min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <span>Share QR</span>
                  </button>
                )}

                {resolvedSlug && (
                  <button
                    type="button"
                    onClick={() => navigate(`/digital-twin/${resolvedSlug}/resume-builder`)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#FCFAF6] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 text-xs font-semibold rounded-xl transition-all duration-150 ease-out active:scale-[0.98] border border-[#E5E1D8] dark:border-[#334155] shadow-2xs min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                    title="Open PDF Resume Builder"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <span>Open Resume Builder</span>
                  </button>
                )}

                <button
                  type="button"
                  id="open-terminal-btn"
                  onClick={() => resolvedSlug && navigate(`/twin/${resolvedSlug}`)}
                  disabled={!resolvedSlug}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-semibold rounded-xl transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  <span>Open Public Chat</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch">
              <div
                className={`bg-[#FCFAF6] dark:bg-[#1E293B] rounded-2xl shadow-sm border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-200 flex flex-col lg:h-[520px] ${
                  isActivityOpen ? 'lg:col-span-8' : 'lg:col-span-12'
                }`}
              >
                <div className="w-full bg-[#FCFAF6] dark:bg-[#1E293B] border-b border-[#E5E1D8] dark:border-[#334155] px-4 py-3 sm:px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <h2 className="text-base sm:text-lg font-serif font-bold text-[#1D2B3A] dark:text-white">
                      Interactive 3D Skill Architecture
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsActivityOpen((prev) => !prev)}
                    aria-expanded={isActivityOpen}
                    aria-label={isActivityOpen ? 'Collapse recruiter activity feed' : 'Expand recruiter activity feed'}
                    title={isActivityOpen ? 'Collapse activity sidebar' : 'Expand activity sidebar'}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-[#5C5751] dark:text-slate-300 hover:text-[#1D2B3A] dark:hover:text-white bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] border border-[#E5E1D8] dark:border-[#334155] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                  >
                    {isActivityOpen ? (
                      <>
                        <PanelRightClose className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                        <span className="hidden sm:inline">Hide Feed</span>
                      </>
                    ) : (
                      <>
                        <PanelRightOpen className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                        <span className="hidden sm:inline">Show Feed ({chatHistory.length})</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="w-full relative flex-1 min-h-0 h-[380px] sm:h-[420px] lg:h-full bg-[#F3EFE9] dark:bg-[#0F172A]">
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-slate-400 text-xs font-serif">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full border-2 border-[#1D2B3A]/20 dark:border-white/20 border-t-[#B25B3E] animate-spin" />
                          <span>Loading 3D Skill Architecture...</span>
                        </div>
                      </div>
                    }
                  >
                    <SkillGraph3D resumeData={twinProfile || stateResumeData} />
                  </Suspense>
                </div>
              </div>

              {isActivityOpen && (
                <div className="lg:col-span-4 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:h-[520px]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8] dark:border-[#334155] shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                      <h3 className="text-sm font-serif font-bold text-[#1D2B3A] dark:text-white truncate">
                        Recruiter Feed
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] px-2 py-0.5 rounded-full shrink-0">
                        {chatHistory.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchAnalytics(twinProfile?.resumeId || resolvedSlug)}
                      disabled={isLoadingHistory}
                      aria-label="Refresh activity feed"
                      className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 text-[11px] font-medium rounded-lg border border-[#E5E1D8] dark:border-[#334155] transition-colors disabled:opacity-50 shadow-2xs shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                      title="Refresh activity feed"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#B25B3E] dark:text-[#E07A5F] ${isLoadingHistory ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 pt-3 flex flex-col">
                    {isLoadingHistory ? (
                      <div className="flex-1 min-h-0 space-y-3 animate-pulse" aria-busy="true" aria-label="Loading recruiter activity">
                        <div className="h-24 rounded-xl bg-[#E5E1D8]/60 dark:bg-[#334155]/50 p-3.5 space-y-2.5">
                          <div className="h-3 w-1/3 rounded bg-[#D4CFC4]/70 dark:bg-[#475569]/60" />
                          <div className="h-3 w-5/6 rounded bg-[#D4CFC4]/50 dark:bg-[#475569]/40" />
                          <div className="h-2.5 w-2/3 rounded bg-[#D4CFC4]/40 dark:bg-[#475569]/30" />
                        </div>
                        <div className="h-24 rounded-xl bg-[#E5E1D8]/60 dark:bg-[#334155]/50 p-3.5 space-y-2.5">
                          <div className="h-3 w-1/4 rounded bg-[#D4CFC4]/70 dark:bg-[#475569]/60" />
                          <div className="h-3 w-3/4 rounded bg-[#D4CFC4]/50 dark:bg-[#475569]/40" />
                          <div className="h-2.5 w-1/2 rounded bg-[#D4CFC4]/40 dark:bg-[#475569]/30" />
                        </div>
                        <div className="h-24 rounded-xl bg-[#E5E1D8]/60 dark:bg-[#334155]/50 p-3.5 space-y-2.5">
                          <div className="h-3 w-1/3 rounded bg-[#D4CFC4]/70 dark:bg-[#475569]/60" />
                          <div className="h-3 w-4/5 rounded bg-[#D4CFC4]/50 dark:bg-[#475569]/40" />
                          <div className="h-2.5 w-3/5 rounded bg-[#D4CFC4]/40 dark:bg-[#475569]/30" />
                        </div>
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        <div className="bg-[#F3EFE9]/75 dark:bg-[#0F172A]/75 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-4 space-y-3.5">
                          <div className="text-center pb-2.5 border-b border-[#E5E1D8] dark:border-[#334155]">
                            <span className="font-mono font-bold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] block">
                              Awaiting Inquiries
                            </span>
                            <h4 className="text-xs font-serif font-bold text-[#1D2B3A] dark:text-white mt-0.5">
                              How Recruiter Analytics Works
                            </h4>
                          </div>

                          <div className="relative space-y-4 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E1D8] dark:before:bg-[#334155]">
                            <div className="relative">
                              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E] dark:border-[#E07A5F] flex items-center justify-center text-[#B25B3E] dark:text-[#E07A5F] shadow-2xs">
                                <Link2 className="w-2.5 h-2.5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-sans font-semibold text-[#1D2B3A] dark:text-slate-100">
                                  1. Share Link Created
                                </h5>
                                <p className="text-[11px] text-[#5C5751] dark:text-slate-400 mt-0.5 leading-relaxed">
                                  Your public Digital Twin URL is live and ready to share.
                                </p>
                              </div>
                            </div>

                            <div className="relative">
                              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E] dark:border-[#E07A5F] flex items-center justify-center text-[#B25B3E] dark:text-[#E07A5F] shadow-2xs">
                                <MessageSquare className="w-2.5 h-2.5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-sans font-semibold text-[#1D2B3A] dark:text-slate-100">
                                  2. Recruiter Inquires via Chat
                                </h5>
                                <p className="text-[11px] text-[#5C5751] dark:text-slate-400 mt-0.5 leading-relaxed">
                                  Hiring managers ask role-specific questions anytime.
                                </p>
                              </div>
                            </div>

                            <div className="relative">
                              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E] dark:border-[#E07A5F] flex items-center justify-center text-[#B25B3E] dark:text-[#E07A5F] shadow-2xs">
                                <Activity className="w-2.5 h-2.5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-sans font-semibold text-[#1D2B3A] dark:text-slate-100">
                                  3. Real-Time Analytics Captured Here
                                </h5>
                                <p className="text-[11px] text-[#5C5751] dark:text-slate-400 mt-0.5 leading-relaxed">
                                  Every conversation logs automatically in this feed.
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => resolvedSlug && navigate(`/twin/${resolvedSlug}`)}
                            disabled={!resolvedSlug}
                            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-semibold rounded-lg transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-60 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test Terminal Now</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3 space-y-1.5 shrink-0">
                          <div className="bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155] rounded-xl px-3 py-1.5 min-h-[44px] flex items-center gap-2 focus-within:border-[#B25B3E] dark:focus-within:border-[#E07A5F] transition-colors">
                            <Search className="w-3.5 h-3.5 text-[#8A847C] dark:text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={activitySearch}
                              onChange={(e) => setActivitySearch(e.target.value)}
                              aria-label="Search recruiter activity feed"
                              placeholder="Search questions, replies, visitors..."
                              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs text-[#1D2B3A] dark:text-slate-100 placeholder:text-[#8A847C] dark:placeholder:text-slate-400"
                            />
                            {activitySearch && (
                              <button
                                type="button"
                                onClick={() => setActivitySearch('')}
                                aria-label="Clear activity search"
                                className="min-w-[36px] min-h-[36px] -mr-1.5 flex items-center justify-center rounded-lg text-[#5C5751] hover:text-[#1D2B3A] dark:text-slate-400 dark:hover:text-white transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {activitySearch.trim().length > 0 && (
                            <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A847C] dark:text-slate-400 px-1">
                              {filteredChatHistory.length} OF {chatHistory.length} INQUIRIES
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 max-h-[360px] sm:max-h-[400px] lg:max-h-none">
                          {filteredChatHistory.length === 0 ? (
                            <div className="bg-[#F3EFE9]/75 dark:bg-[#0F172A]/75 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-5 text-center space-y-3">
                              <p className="text-xs font-serif font-semibold text-[#1D2B3A] dark:text-white">
                                No matching inquiries found
                              </p>
                              <p className="text-[11px] text-[#5C5751] dark:text-slate-400 leading-relaxed">
                                No recruiter questions, answers, or visitors match your search term.
                              </p>
                              <button
                                type="button"
                                onClick={() => setActivitySearch('')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                              >
                                <X className="w-3 h-3" />
                                <span>Clear Search</span>
                              </button>
                            </div>
                          ) : (
                            filteredChatHistory.map((item, index) => (
                              <div
                                key={item.id || index}
                                className="bg-[#F3EFE9]/65 dark:bg-[#0F172A]/75 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3.5 space-y-2.5 shadow-2xs transition-colors hover:border-[#B25B3E]/40 dark:hover:border-[#E07A5F]/40"
                              >
                                <div className="flex items-center justify-between text-xs text-[#5C5751] dark:text-slate-400 gap-2">
                                  <span className="font-semibold text-[#B25B3E] dark:text-[#E07A5F] flex items-center gap-1.5 truncate">
                                    <User className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{item.visitorName || 'Anonymous Recruiter'}</span>
                                  </span>
                                  <span className="flex items-center gap-1 font-mono text-[10px] text-[#8A847C] dark:text-slate-400 shrink-0">
                                    <Clock className="w-3 h-3 text-[#8A847C] dark:text-slate-400" />
                                    {item.createdAt
                                      ? new Date(item.createdAt).toLocaleString([], {
                                          dateStyle: 'short',
                                          timeStyle: 'short'
                                        })
                                      : 'Just now'}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-mono font-bold text-[10px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block">
                                    VISITOR ASKED:
                                  </span>
                                  <p className="text-xs font-medium text-[#1D2B3A] dark:text-slate-100 bg-[#FCFAF6] dark:bg-[#1E293B] p-2.5 rounded-lg border border-[#E5E1D8] dark:border-[#334155]">
                                    {item.question}
                                  </p>
                                </div>

                                <div className="space-y-1 pt-0.5">
                                  <span className="font-mono font-bold text-[10px] uppercase tracking-widest text-[#1D2B3A] dark:text-slate-200 flex items-center gap-1">
                                    <Bot className="w-3 h-3 text-[#B25B3E] dark:text-[#E07A5F]" />
                                    <span>AI ANSWERED:</span>
                                  </span>
                                  <div className="text-[11px] text-[#FCFAF6] dark:text-slate-100 leading-relaxed bg-[#1D2B3A] dark:bg-[#0B1120] p-3 rounded-xl shadow-2xs whitespace-pre-wrap border border-[#1D2B3A] dark:border-[#334155]">
                                    {item.aiResponse}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-5 sm:p-6 shadow-sm h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-[#E5E1D8] dark:border-[#334155] pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1D2B3A] dark:bg-[#B25B3E] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs shrink-0 select-none">
                        {getInitials(twinProfile?.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-serif font-bold text-[#1D2B3A] dark:text-white truncate">
                          {twinProfile?.name}
                        </h3>
                        <p className="text-xs font-mono text-[#8A847C] dark:text-slate-400 truncate">
                          Resume ID: {twinProfile?.resumeId}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-100 border border-[#E5E1D8] dark:border-[#334155] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#047857] dark:text-[#10B981]" />
                      <span>Persona Synced</span>
                    </span>
                  </div>

                  <div>
                    <label className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 flex items-center gap-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                      <span>Executive Persona Bio</span>
                    </label>
                    <p className="text-sm text-[#5C5751] dark:text-slate-300 bg-[#F3EFE9]/80 dark:bg-[#0F172A]/80 p-4 rounded-xl border border-[#E5E1D8] dark:border-[#334155] leading-relaxed">
                      {twinProfile?.bio || 'No bio provided.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-4">
                  <div className="bg-[#F3EFE9]/80 dark:bg-[#0F172A]/80 p-3.5 rounded-xl border border-[#E5E1D8] dark:border-[#334155]">
                    <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block mb-1 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                      <span>Speaking Tone</span>
                    </span>
                    <span className="text-sm font-semibold text-[#1D2B3A] dark:text-white">
                      {twinProfile?.tone || 'Professional'}
                    </span>
                  </div>

                  <div className="bg-[#F3EFE9]/80 dark:bg-[#0F172A]/80 p-3.5 rounded-xl border border-[#E5E1D8] dark:border-[#334155]">
                    <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block mb-1 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                      <span>Public Slug</span>
                    </span>
                    <span className="text-sm font-mono text-[#B25B3E] dark:text-[#E07A5F] font-semibold truncate block">
                      {resolvedSlug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-sm h-full">
                <div>
                  <h3 className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#1D2B3A] dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <span>Twin Telemetry</span>
                  </h3>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-slate-400 shrink-0">Total Inquiries</span>
                      <span className="text-[#B25B3E] dark:text-[#E07A5F] font-bold font-mono text-sm text-right min-w-0 break-words">
                        {chatHistory.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-slate-400 shrink-0">AI Engine</span>
                      <span className="text-[#1D2B3A] dark:text-slate-100 font-medium text-right min-w-0 break-words">
                        Google Gemini Generative AI
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-slate-400 shrink-0">Response Protocol</span>
                      <span className="text-[#1D2B3A] dark:text-slate-100 font-medium text-right min-w-0 break-words">
                        STAR-Method PDF Grounded
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-slate-400 shrink-0">Data Security</span>
                      <span className="text-[#1D2B3A] dark:text-slate-100 font-medium text-right min-w-0 break-words">
                        Encrypted Persona Storage
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-[#5C5751] dark:text-slate-400 shrink-0">Status</span>
                      <span className="text-[#047857] dark:text-[#10B981] font-semibold flex items-center justify-end gap-1.5 text-right min-w-0 break-words">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#047857] dark:bg-[#10B981] animate-pulse shrink-0" />
                        <span>Active &amp; Live</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F3EFE9]/80 dark:bg-[#0F172A]/80 border border-[#E5E1D8] dark:border-[#334155] flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#B25B3E] dark:text-[#E07A5F] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5C5751] dark:text-slate-300 leading-relaxed">
                    All candidate interview responses are strictly grounded in your validated resume facts.
                  </p>
                </div>
              </div>
            </div>

            <motion.section
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="pt-6 border-t border-[#E5E1D8] dark:border-[#334155] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="font-mono font-bold uppercase tracking-widest text-[10px] sm:text-[11px] text-[#B25B3E] dark:text-[#E07A5F] block">
                    VERIFIED EXTRACTION DOSSIER
                  </span>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1D2B3A] dark:text-white tracking-tight mt-1">
                    Parsed Resume Architecture
                  </h2>
                </div>

                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest bg-[#FCFAF6] dark:bg-[#1E293B] text-[#5C5751] dark:text-slate-300 border border-[#E5E1D8] dark:border-[#334155] shrink-0 self-start sm:self-auto">
                  {verifiedSkills.length} SKILLS &middot; {verifiedExperience.length} ROLES &middot; {verifiedEducation.length} DEGREES
                </span>
              </div>

              <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8] dark:border-[#334155] mb-4">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1D2B3A] dark:text-white">
                      Verified Competency Matrix
                    </h3>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-[#10B981] border border-emerald-200 dark:border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#047857] dark:bg-[#10B981]" />
                    <span>SYNCED WITH 3D GRAPH</span>
                  </span>
                </div>

                {verifiedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {verifiedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-[#334155] hover:border-[#B25B3E]/50 dark:hover:border-[#E07A5F]/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-400 leading-relaxed">
                    No explicit skills list was detected in the uploaded PDF. You can add or refine skills directly inside the Resume Builder.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 lg:relative">
                  <div className="lg:absolute lg:inset-0 flex flex-col bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-sm">
                    <div className="shrink-0 flex items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8] dark:border-[#334155] mb-4">
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                        <h3 className="font-serif font-bold text-lg text-[#1D2B3A] dark:text-white">
                          Education
                        </h3>
                      </div>

                      <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-slate-300 border border-[#E5E1D8] dark:border-[#334155] shrink-0">
                        {verifiedEducation.length} {verifiedEducation.length === 1 ? 'DEGREE' : 'DEGREES'}
                      </span>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                      {verifiedEducation.length > 0 ? (
                        <div className="divide-y divide-[#E5E1D8]/80 dark:divide-[#334155]/80">
                          {verifiedEducation.map((edu, idx) => (
                            <div
                              key={`${edu.degree || 'edu'}-${idx}`}
                              className={idx === 0 ? 'pb-3.5' : idx === verifiedEducation.length - 1 ? 'pt-3.5' : 'py-3.5'}
                            >
                              <p className="font-serif font-bold text-sm text-[#1D2B3A] dark:text-white leading-snug">
                                {edu.degree || 'Academic Credential'}
                              </p>
                              {edu.institution && (
                                <p className="text-xs text-[#5C5751] dark:text-slate-300 mt-1">
                                  {edu.institution}
                                </p>
                              )}
                              {edu.year && (
                                <span className="inline-block mt-2 font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#8A847C] dark:text-slate-400 border border-[#E5E1D8] dark:border-[#334155]">
                                  {edu.year}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-400 leading-relaxed">
                          No education records parsed.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E1D8] dark:border-[#334155]">
                    <UserCheck className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <h3 className="font-serif font-bold text-lg text-[#1D2B3A] dark:text-white">
                      Parsed Contact Details
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    {twinProfile?.title && (
                      <div className="p-3 rounded-xl bg-[#F3EFE9]/70 dark:bg-[#0F172A]/60 border border-[#E5E1D8] dark:border-[#334155]">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block mb-0.5">
                          ROLE TITLE
                        </span>
                        <span className="font-medium text-[#1D2B3A] dark:text-white">
                          {twinProfile.title}
                        </span>
                      </div>
                    )}

                    {hasContactDetails ? (
                      <>
                        {twinProfile?.email && (
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F3EFE9]/70 dark:bg-[#0F172A]/60 border border-[#E5E1D8] dark:border-[#334155]">
                            <Mail className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                            <span className="text-[#1D2B3A] dark:text-slate-200 break-all">
                              {twinProfile.email}
                            </span>
                          </div>
                        )}
                        {twinProfile?.phone && (
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F3EFE9]/70 dark:bg-[#0F172A]/60 border border-[#E5E1D8] dark:border-[#334155]">
                            <Phone className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                            <span className="text-[#1D2B3A] dark:text-slate-200">
                              {twinProfile.phone}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-[#5C5751] dark:text-slate-400 leading-relaxed">
                        No direct contact email or phone detected in PDF.
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F3EFE9]/70 dark:bg-[#0F172A]/60 border border-[#E5E1D8] dark:border-[#334155]">
                      <Radio className="w-4 h-4 text-[#047857] dark:text-[#10B981] shrink-0" />
                      <span className="font-mono text-xs text-[#B25B3E] dark:text-[#E07A5F] break-all">
                        {resolvedSlug ? `/twin/${resolvedSlug}` : 'Pending public slug'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8] dark:border-[#334155] mb-5">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1D2B3A] dark:text-white">
                      Experience &amp; Career Impact
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-slate-300 border border-[#E5E1D8] dark:border-[#334155]">
                    {verifiedExperience.length} {verifiedExperience.length === 1 ? 'ROLE' : 'ROLES'}
                  </span>
                </div>

                {verifiedExperience.length > 0 ? (
                  <div className="relative pl-6 border-l border-[#E5E1D8] dark:border-[#334155] space-y-6">
                    {verifiedExperience.map((exp, idx) => (
                      <div key={`${exp.role || exp.title || 'role'}-${idx}`} className="relative">
                        <span
                          aria-hidden="true"
                          className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#B25B3E] dark:bg-[#E07A5F] ring-4 ring-[#FCFAF6] dark:ring-[#1E293B]"
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
                          <h4 className="font-serif font-bold text-base text-[#1D2B3A] dark:text-white">
                            {exp.role || exp.title || 'Experience Role'}
                          </h4>
                          {exp.duration && (
                            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-slate-300 border border-[#E5E1D8] dark:border-[#334155] w-fit shrink-0">
                              {exp.duration}
                            </span>
                          )}
                        </div>

                        {exp.company && (
                          <p className="text-xs sm:text-sm font-medium text-[#B25B3E] dark:text-[#E07A5F] mt-0.5">
                            {exp.company}
                          </p>
                        )}

                        {exp.description && (
                          <p className="text-sm leading-relaxed text-[#5C5751] dark:text-slate-300 mt-2 whitespace-pre-wrap">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-400 leading-relaxed">
                    No structured experience entries were extracted from this PDF.
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-[#1D2B3A] dark:bg-[#1E293B] text-white border border-[#1D2B3A] dark:border-[#334155] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-400 block">
                    NEXT STEP
                  </span>
                  <p className="font-serif font-semibold text-base sm:text-lg text-white">
                    Want to refine extracted details or preview the recruiter interview?
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {resolvedSlug && (
                    <button
                      type="button"
                      onClick={() => navigate(`/digital-twin/${resolvedSlug}/resume-builder`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-sans font-semibold transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#E07A5F]" />
                      <span>Customize A4 Resume</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => resolvedSlug && navigate(`/twin/${resolvedSlug}`)}
                    disabled={!resolvedSlug}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-sans font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Live Recruiter Chat</span>
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        )}
      </section>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isQrModalOpen && resolvedSlug && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                onClick={() => setIsQrModalOpen(false)}
                className="fixed inset-0 z-[100] bg-[#1D2B3A]/65 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="qr-share-modal-title"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl w-full max-w-sm sm:max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono uppercase tracking-widest text-[10px] sm:text-[11px] font-bold text-[#B25B3E] dark:text-[#E07A5F] block">
                        RECRUITER ACCESS PASS
                      </span>
                      <h2
                        id="qr-share-modal-title"
                        className="font-serif text-xl sm:text-2xl font-bold text-[#1D2B3A] dark:text-white mt-0.5"
                      >
                        Scan to Interview Twin
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(false)}
                      aria-label="Close QR share modal"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#5C5751] hover:text-[#1D2B3A] dark:text-slate-400 dark:hover:text-white hover:bg-[#E5E1D8]/70 dark:hover:bg-[#334155] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <div
                      ref={qrWrapperRef}
                      className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E1D8] shadow-sm inline-flex max-w-full mx-auto [&_canvas]:max-w-full [&_canvas]:h-auto"
                    >
                      <QRCodeCanvas
                        value={publicLink}
                        size={184}
                        bgColor="#FFFFFF"
                        fgColor="#1D2B3A"
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  <div className="bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155] rounded-xl px-3.5 py-2 text-center font-mono text-xs text-[#5C5751] dark:text-slate-300 break-all">
                    {publicLink}
                  </div>

                  <div className="flex flex-col gap-2.5 w-full mt-4">
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 border border-[#E5E1D8] dark:border-[#334155] text-sm font-sans font-medium transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-[#047857] dark:text-[#10B981] shrink-0" />
                            <span className="text-[#047857] dark:text-[#10B981]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsQrModalOpen(false);
                          navigate(`/twin/${resolvedSlug}`);
                        }}
                        className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 border border-[#E5E1D8] dark:border-[#334155] text-sm font-sans font-medium transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                      >
                        <ExternalLink className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                        <span>Open Chat</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-medium bg-[#B25B3E] hover:bg-[#9E4D32] text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>Download QR PNG</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </MarketingLayout>
  );
}
