import React, { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';

const SkillGraph3D = React.lazy(() => import('../components/SkillGraph3D'));

import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Bot,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  User,
  FileText,
  Sliders,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Clock,
  Inbox,
  PanelRightClose,
  PanelRightOpen,
  Link2,
  Activity
} from 'lucide-react';

export default function DigitalTwin() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateResumeData = location.state?.resumeData;

  const [twinProfile, setTwinProfile] = useState(stateResumeData || null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(!stateResumeData);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-gray-100 flex flex-col font-sans selection:bg-[#B25B3E] selection:text-[#FCFAF6]">
      <header className="border-b border-[#E5E1D8] dark:border-[#334155] bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back to Resume"
            className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#1D2B3A] dark:text-gray-100 hover:bg-[#E5E1D8] dark:hover:bg-[#334155] transition-colors bg-[#FCFAF6] dark:bg-[#1E293B] px-3.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg border border-[#E5E1D8] dark:border-[#334155] shadow-xs shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back<span className="hidden sm:inline"> to Resume</span></span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-[11px] font-sans font-semibold text-[#1D2B3A] dark:text-gray-100 uppercase tracking-widest truncate">
                Gemini <span className="hidden sm:inline">AI </span>Synchronized
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-[#E5E1D8] dark:border-[#334155] border-t-[#B25B3E] animate-spin"></div>
              <Bot className="w-6 h-6 text-[#1D2B3A] dark:text-gray-100 absolute inset-0 m-auto" />
            </div>
            <p className="text-[#1D2B3A] dark:text-white font-serif font-semibold">Initializing your Digital Twin workspace...</p>
            <p className="text-xs text-[#5C5751] dark:text-gray-400">Syncing resume embeddings and persona parameters</p>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E]/40 dark:border-[#B25B3E]/60 rounded-2xl p-6 text-center space-y-3 shadow-md">
            <AlertCircle className="w-10 h-10 text-[#B25B3E] mx-auto" />
            <h3 className="text-lg font-serif font-bold text-[#1D2B3A] dark:text-white">Digital Twin Profile</h3>
            <p className="text-sm text-[#5C5751] dark:text-gray-300">{error}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/studio')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D2B3A] dark:bg-[#334155] hover:bg-[#2A3F55] dark:hover:bg-[#475569] text-[#FCFAF6] text-xs font-semibold rounded-xl shadow-xs transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
              >
                <ArrowLeft className="w-4 h-4" />
                Upload Resume
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FCFAF6] dark:bg-[#1E293B] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-gray-100 text-xs font-semibold rounded-xl border border-[#E5E1D8] dark:border-[#334155] shadow-2xs transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#B25B3E]" />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl px-4 sm:px-6 py-3 sm:py-3.5 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors">
              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-[#1D2B3A] dark:bg-white text-[#FCFAF6] dark:text-[#0F172A] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-xs select-none shrink-0">
                  {getInitials(twinProfile?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif font-bold text-base sm:text-lg text-[#1D2B3A] dark:text-white truncate">
                      {twinProfile?.name || 'Digital Twin'}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-[#F3EFE9] dark:bg-[#0F172A] text-emerald-700 dark:text-emerald-400 border border-[#E5E1D8]/60 dark:border-transparent shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="hidden xs:inline">Active Persona</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5C5751] dark:text-gray-400">
                    <span className="font-mono text-[11px] text-[#B25B3E] dark:text-[#E07A5F] truncate">
                      {twinProfile?.publicSlug ? `/twin/${twinProfile.publicSlug}` : 'Generating link...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label={copied ? 'Share link copied' : 'Copy share link to clipboard'}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 min-w-[90px] px-3.5 py-2.5 sm:py-2 bg-[#FCFAF6] dark:bg-[#1E293B] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-gray-100 text-xs font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 border border-[#E5E1D8] dark:border-[#334155] shadow-2xs shrink-0 min-h-[44px] sm:min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                >
                  <span aria-live="polite" className="inline-flex items-center gap-1.5 transition-all duration-200 ease-out">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </span>
                </button>

                {twinProfile?.publicSlug && (
                  <button
                    type="button"
                    onClick={() => navigate(`/digital-twin/${twinProfile.publicSlug}/resume-builder`)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-[#FCFAF6] dark:bg-[#1E293B] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-gray-100 text-xs font-semibold rounded-xl transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] border border-[#E5E1D8] dark:border-[#334155] shadow-2xs shrink-0 min-h-[44px] sm:min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                    title="Open PDF Resume Builder"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                    <span>Resume Builder</span>
                  </button>
                )}

                <button
                  type="button"
                  id="open-terminal-btn"
                  onClick={() => navigate(`/twin/${twinProfile?.publicSlug}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#B25B3E] hover:bg-[#9C4E34] text-[#FCFAF6] text-xs font-semibold rounded-xl transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-sm shrink-0 min-h-[44px] sm:min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#FCFAF6]" />
                  <span>Launch Recruiter Interview</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch">
              <div
                className={`bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-200 flex flex-col lg:h-[520px] ${
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-[#5C5751] dark:text-gray-300 hover:text-[#1D2B3A] dark:hover:text-white bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] border border-[#E5E1D8] dark:border-[#334155] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
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

                <div className="w-full relative flex-1 min-h-0 h-[380px] sm:h-[420px] lg:h-full bg-white dark:bg-[#0F172A]">
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-gray-400 text-xs font-serif">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full border-2 border-[#1D2B3A]/20 dark:border-white/20 border-t-[#B25B3E] animate-spin"></div>
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
                      <span className="text-[10px] font-sans font-semibold bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] px-2 py-0.5 rounded-full shrink-0">
                        {chatHistory.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchAnalytics(twinProfile?.resumeId || twinProfile?.publicSlug)}
                      disabled={isLoadingHistory}
                      aria-label="Refresh activity feed"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-gray-100 text-[11px] font-medium rounded-lg border border-[#E5E1D8] dark:border-[#334155] transition-colors disabled:opacity-50 shadow-2xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                      title="Refresh activity feed"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#B25B3E] ${isLoadingHistory ? 'animate-spin' : ''}`} />
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
                        <div className="bg-[#F3EFE9]/70 dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-4 space-y-3.5">
                          <div className="text-center pb-2 border-b border-[#E5E1D8]/60 dark:border-[#334155]/60">
                            <span className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] block">
                              Awaiting Inquiries
                            </span>
                            <h4 className="text-xs font-serif font-bold text-[#1D2B3A] dark:text-white mt-0.5">
                              How Recruiter Analytics Works
                            </h4>
                          </div>

                          <div className="relative space-y-4 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E1D8] dark:before:bg-[#334155]">
                            <div className="relative">
                              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E] flex items-center justify-center text-[#B25B3E] dark:text-[#E07A5F] shadow-2xs">
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
                              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E] flex items-center justify-center text-[#B25B3E] dark:text-[#E07A5F] shadow-2xs">
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
                              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#B25B3E] flex items-center justify-center text-[#B25B3E] dark:text-[#E07A5F] shadow-2xs">
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
                            onClick={() => navigate(`/twin/${twinProfile?.publicSlug}`)}
                            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#B25B3E] hover:bg-[#9C4E34] text-[#FCFAF6] text-xs font-semibold rounded-lg transition-all duration-150 ease-out hover:scale-[1.01] active:scale-[0.99] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test Terminal Now</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 max-h-[360px] sm:max-h-[400px] lg:max-h-none">
                        {chatHistory.map((item, index) => (
                          <div
                            key={item.id || index}
                            className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3.5 space-y-2.5 shadow-2xs transition-all hover:border-[#1D2B3A]/40 dark:hover:border-gray-500"
                          >
                            <div className="flex items-center justify-between text-xs text-[#5C5751] dark:text-gray-400">
                              <span className="font-semibold text-[#B25B3E] dark:text-[#E07A5F] flex items-center gap-1.5 truncate">
                                <User className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.visitorName || 'Anonymous Recruiter'}</span>
                              </span>
                              <span className="flex items-center gap-1 font-mono text-[10px] text-[#5C5751] dark:text-gray-400 shrink-0">
                                <Clock className="w-3 h-3 text-[#5C5751] dark:text-gray-400" />
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleString([], {
                                      dateStyle: 'short',
                                      timeStyle: 'short',
                                    })
                                  : 'Just now'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block">
                                Visitor asked:
                              </span>
                              <p className="text-xs font-medium text-[#1D2B3A] dark:text-gray-100 bg-[#F3EFE9] dark:bg-[#0F172A]/70 p-2.5 rounded-lg border border-[#E5E1D8]/60 dark:border-transparent">
                                {item.question}
                              </p>
                            </div>

                            <div className="space-y-1 pt-0.5">
                              <span className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[#1D2B3A] dark:text-gray-200 flex items-center gap-1 block">
                                <Bot className="w-3 h-3 text-[#B25B3E]" />
                                AI Answered:
                              </span>
                              <div className="text-[11px] text-[#FCFAF6] dark:text-gray-100 leading-relaxed bg-[#1D2B3A] dark:bg-[#0F172A]/90 p-3 rounded-xl shadow-2xs whitespace-pre-wrap border border-transparent dark:border-white/5">
                                {item.aiResponse}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-4 sm:p-6 shadow-sm h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E1D8] dark:border-[#334155] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1D2B3A] dark:bg-white text-[#FCFAF6] dark:text-[#0F172A] flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                        {getInitials(twinProfile?.name)}
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#1D2B3A] dark:text-white">{twinProfile?.name}</h3>
                        <p className="text-xs text-[#5C5751] dark:text-gray-400">Resume ID: {twinProfile?.resumeId}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans font-medium bg-[#F3EFE9] dark:bg-[#0F172A]/80 text-[#1D2B3A] dark:text-gray-100 border border-[#E5E1D8]/60 dark:border-transparent">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Persona Synced
                    </span>
                  </div>

                  <div>
                    <label className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 flex items-center gap-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-[#B25B3E]" />
                      Executive Persona Bio
                    </label>
                    <p className="text-sm text-[#5C5751] dark:text-gray-300 bg-[#F3EFE9] dark:bg-[#0F172A]/80 p-4 rounded-xl border border-[#E5E1D8]/60 dark:border-transparent leading-relaxed">
                      {twinProfile?.bio || 'No bio provided.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-4">
                  <div className="bg-[#F3EFE9] dark:bg-[#0F172A]/80 p-3.5 rounded-xl border border-[#E5E1D8]/60 dark:border-transparent">
                    <span className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-1 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-[#B25B3E]" />
                      Speaking Tone
                    </span>
                    <span className="text-sm font-semibold text-[#1D2B3A] dark:text-white">
                      {twinProfile?.tone || 'Professional'}
                    </span>
                  </div>

                  <div className="bg-[#F3EFE9] dark:bg-[#0F172A]/80 p-3.5 rounded-xl border border-[#E5E1D8]/60 dark:border-transparent">
                    <span className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-1 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-[#B25B3E]" />
                      Public Slug
                    </span>
                    <span className="text-sm font-mono text-[#B25B3E] dark:text-[#E07A5F] font-semibold truncate block">
                      {twinProfile?.publicSlug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl p-4 sm:p-6 space-y-5 flex flex-col justify-between shadow-sm h-full">
                <div>
                  <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-[#1D2B3A] dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#B25B3E]" />
                    Twin Telemetry
                  </h3>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-gray-400">Total Inquiries</span>
                      <span className="text-[#B25B3E] dark:text-[#E07A5F] font-bold font-mono text-sm">{chatHistory.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-gray-400">AI Engine</span>
                      <span className="text-[#1D2B3A] dark:text-gray-100 font-medium">Gemini 1.5 / 3.5 Flash</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-gray-400">Response Protocol</span>
                      <span className="text-[#1D2B3A] dark:text-gray-100 font-medium">Concise Executive Summary Mode</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8] dark:border-[#334155]">
                      <span className="text-[#5C5751] dark:text-gray-400">Data Security</span>
                      <span className="text-[#1D2B3A] dark:text-gray-100 font-medium">Encrypted Persona Storage</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5C5751] dark:text-gray-400">Status</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Active & Live
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A]/80 border border-[#E5E1D8]/60 dark:border-transparent flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#B25B3E] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5C5751] dark:text-gray-300 leading-relaxed">
                    All candidate interview responses are strictly grounded in your validated resume facts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
