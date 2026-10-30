import React, { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

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
  Inbox
} from 'lucide-react';

export default function DigitalTwin() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract resume data passed via state if available
  const stateResumeData = location.state?.resumeData;

  const [twinProfile, setTwinProfile] = useState(stateResumeData || null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(!stateResumeData);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTwinProfile = async () => {
      // 1. If passed via router state from Result.jsx, use and persist it
      if (stateResumeData) {
        setTwinProfile(stateResumeData);
        localStorage.setItem('activeTwinSlug', stateResumeData.publicSlug || stateResumeData.id);
        setIsLoading(false);
        fetchAnalytics(stateResumeData.resumeId || stateResumeData.publicSlug || stateResumeData.id);
        return;
      }

      // 2. Check localStorage for previously active twin
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

      // 3. Neither state nor localStorage found
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

  const handleCopyLink = () => {
    if (!twinProfile?.publicSlug && !twinProfile?.slug) return;
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F3EFE9] text-[#1D2B3A] flex flex-col font-sans selection:bg-[#B25B3E] selection:text-[#FCFAF6]">
      {/* Top Editorial Navigation Bar */}
      <header className="border-b border-[#E5E1D8] bg-[#FCFAF6]/90 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#1D2B3A] hover:bg-[#E5E1D8] transition-colors bg-[#FCFAF6] px-3 sm:px-3.5 py-1.5 rounded-lg border border-[#E5E1D8] shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back<span className="hidden sm:inline"> to Resume</span></span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-serif text-[#1D2B3A] font-medium tracking-wide uppercase truncate">
              Gemini <span className="hidden sm:inline">AI </span>Synchronized
            </span>
          </div>
        </div>
      </header>

      {/* Hero Header with Organic Sand Aesthetic */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FCFAF6] via-[#F3EFE9] to-[#F3EFE9] border-b border-[#E5E1D8] px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FCFAF6] border border-[#E5E1D8] px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-serif font-bold text-[#B25B3E] mb-3 sm:mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Persona Control Center
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#1D2B3A] mb-2 sm:mb-3">
            Your Digital Twin Control Center
          </h1>
          <p className="text-[#5C5751] max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            An interactive, AI-grounded avatar that answers recruiter questions, illustrates your STAR-method achievements, and pitches your career 24/7.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-[#E5E1D8] border-t-[#B25B3E] animate-spin"></div>
              <Bot className="w-6 h-6 text-[#1D2B3A] absolute inset-0 m-auto" />
            </div>
            <p className="text-[#1D2B3A] font-serif font-semibold">Initializing your Digital Twin in MySQL database...</p>
            <p className="text-xs text-[#5C5751]">Syncing resume embeddings and persona parameters</p>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto bg-[#FCFAF6] border border-[#B25B3E]/40 rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <AlertCircle className="w-10 h-10 text-[#B25B3E] mx-auto" />
            <h3 className="text-lg font-serif font-bold text-[#1D2B3A]">Digital Twin Profile</h3>
            <p className="text-sm text-[#5C5751]">{error}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] text-xs font-semibold rounded-xl shadow-xs transition-all min-h-[40px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Upload Resume
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FCFAF6] hover:bg-[#E5E1D8] text-[#1D2B3A] text-xs font-semibold rounded-xl border border-[#E5E1D8] shadow-2xs transition-all min-h-[40px]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#B25B3E]" />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Public Link Share Bar */}
            <div className="bg-[#FCFAF6] border border-[#E5E1D8] rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#B25B3E]" />
                    <span className="text-xs font-serif font-bold text-[#B25B3E] uppercase tracking-wider">
                      Public Recruiter Access Link
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#1D2B3A]">
                    Share your Twin with hiring managers & recruiters
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:max-w-2xl">
                  {/* Readonly URL Field with Embedded Copy Button */}
                  <div className="flex items-center justify-between gap-2 bg-[#F3EFE9] border border-[#E5E1D8] rounded-xl px-3.5 py-2 flex-1 min-w-0">
                    <span className="text-[#1D2B3A] font-mono text-xs select-all truncate font-medium">
                      {publicLink}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FCFAF6] hover:bg-[#E5E1D8] text-[#1D2B3A] text-xs font-semibold rounded-lg transition-all active:scale-95 border border-[#E5E1D8] shadow-2xs shrink-0 min-h-[36px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Responsive Action Buttons with Expanded Mobile Touch Targets */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => navigate(`/digital-twin/${twinProfile?.publicSlug}/resume-builder`)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#B25B3E] hover:bg-[#9C4E34] text-[#FCFAF6] text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-sm min-h-[42px]"
                      title="Open PDF Resume Builder"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#EFE8DD]" />
                      <span>Resume Builder</span>
                    </button>
                    <button
                      id="open-terminal-btn"
                      onClick={() => navigate(`/twin/${twinProfile?.publicSlug}`)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-sm min-h-[42px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#EFE8DD]" />
                      <span>Open Terminal</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive 3D Skill Architecture Card */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-[#D4CFC4] overflow-hidden mb-8">
              <div className="w-full bg-[#FCFAF6] border-b border-[#E5E1D8] px-4 py-4 md:px-6 flex justify-between items-center">
                <h2 className="font-serif text-[#1D2B3A] text-xl font-bold">
                  Interactive 3D Skill Architecture
                </h2>
              </div>
              <div className="w-full relative h-[350px] sm:h-[450px] lg:h-[550px] bg-white">
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-[#F3EFE9] text-[#5C5751] text-xs font-serif">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[#1D2B3A]/20 border-t-[#B25B3E] animate-spin"></div>
                        <span>Loading 3D Skill Architecture...</span>
                      </div>
                    </div>
                  }
                >
                  <SkillGraph3D resumeData={twinProfile || stateResumeData} />
                </Suspense>
              </div>
            </div>

            {/* Recent Recruiter Activity Section */}
            <div className="bg-[#FCFAF6] border border-[#E5E1D8] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E1D8] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F3EFE9] border border-[#E5E1D8] flex items-center justify-center text-[#B25B3E] shrink-0">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-[#1D2B3A] flex items-center gap-2 flex-wrap">
                      Recent Recruiter Activity
                      <span className="text-xs font-sans font-medium bg-[#F3EFE9] text-[#B25B3E] border border-[#E5E1D8] px-2.5 py-0.5 rounded-full">
                        {chatHistory.length} {chatHistory.length === 1 ? 'Inquiry' : 'Inquiries'}
                      </span>
                    </h2>
                    <p className="text-xs text-[#5C5751]">
                      Real-time feed of questions asked by visiting hiring managers and recruiters
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => fetchAnalytics(twinProfile?.resumeId || twinProfile?.publicSlug)}
                  disabled={isLoadingHistory}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F3EFE9] hover:bg-[#E5E1D8] text-[#1D2B3A] text-xs font-medium rounded-lg border border-[#E5E1D8] transition-colors disabled:opacity-50 shadow-2xs self-start sm:self-auto min-h-[36px]"
                  title="Refresh activity feed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#B25B3E] ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  Refresh Feed
                </button>
              </div>

              {/* Chat History List */}
              {chatHistory.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3 bg-[#F3EFE9]/50 rounded-xl border border-[#E5E1D8]">
                  <div className="w-10 h-10 rounded-full bg-[#FCFAF6] border border-[#E5E1D8] flex items-center justify-center text-[#5C5751] mx-auto shadow-2xs">
                    <Inbox className="w-5 h-5 text-[#B25B3E]" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#1D2B3A]">No Recruiter Inquiries Recorded Yet</h3>
                  <p className="text-xs text-[#5C5751] max-w-sm mx-auto">
                    Share your public link with hiring teams or test it yourself. All questions and STAR responses will automatically stream here!
                  </p>
                  <button
                    onClick={() => navigate(`/twin/${twinProfile?.publicSlug}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B25B3E] hover:bg-[#9C4E34] text-[#FCFAF6] text-xs font-semibold rounded-lg transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Test Terminal Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {chatHistory.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="bg-[#FCFAF6] border border-[#E5E1D8] rounded-xl p-5 space-y-3 shadow-xs transition-all hover:border-[#1D2B3A]/40"
                    >
                      <div className="flex items-center justify-between text-xs text-[#5C5751]">
                        <span className="font-semibold text-[#B25B3E] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {item.visitorName || 'Anonymous Recruiter'}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-[#5C5751]">
                          <Clock className="w-3 h-3 text-[#5C5751]" />
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Just now'}
                        </span>
                      </div>

                      {/* Question */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-serif font-bold text-[#5C5751] uppercase tracking-wider block">
                          Visitor asked:
                        </span>
                        <p className="text-sm font-medium text-[#1D2B3A] bg-[#F3EFE9] p-3 rounded-lg border border-[#E5E1D8]">
                          {item.question}
                        </p>
                      </div>

                      {/* Answer */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-serif font-bold text-[#1D2B3A] uppercase tracking-wider flex items-center gap-1 block">
                          <Bot className="w-3.5 h-3.5 text-[#B25B3E]" />
                          AI Answered:
                        </span>
                        <div className="text-xs text-[#FCFAF6] leading-relaxed bg-[#1D2B3A] p-4 rounded-xl shadow-sm whitespace-pre-wrap">
                          {item.aiResponse}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Twin Attributes & Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Persona Profile Card */}
              <div className="md:col-span-2 bg-[#FCFAF6] border border-[#E5E1D8] rounded-2xl p-4 sm:p-6 shadow-sm h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1D2B3A] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                        {twinProfile?.name ? twinProfile.name.charAt(0) : 'T'}
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#1D2B3A]">{twinProfile?.name}</h3>
                        <p className="text-xs text-[#5C5751]">Resume ID: {twinProfile?.resumeId}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[#F3EFE9] text-[#1D2B3A] border border-[#E5E1D8]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      MySQL Synced
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-serif font-bold text-[#5C5751] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-[#B25B3E]" />
                      Executive Persona Bio
                    </label>
                    <p className="text-sm text-[#5C5751] bg-[#F3EFE9] p-4 rounded-xl border border-[#E5E1D8] leading-relaxed">
                      {twinProfile?.bio || 'No bio provided.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-4">
                  <div className="bg-[#F3EFE9] p-3.5 rounded-xl border border-[#E5E1D8]">
                    <span className="text-xs text-[#5C5751] block mb-1 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-[#B25B3E]" />
                      Speaking Tone
                    </span>
                    <span className="text-sm font-semibold text-[#1D2B3A]">
                      {twinProfile?.tone || 'Professional'}
                    </span>
                  </div>

                  <div className="bg-[#F3EFE9] p-3.5 rounded-xl border border-[#E5E1D8]">
                    <span className="text-xs text-[#5C5751] block mb-1 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-[#B25B3E]" />
                      Public Slug
                    </span>
                    <span className="text-sm font-mono text-[#B25B3E] font-semibold truncate block">
                      {twinProfile?.publicSlug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Engine Telemetry */}
              <div className="bg-[#FCFAF6] border border-[#E5E1D8] rounded-2xl p-4 sm:p-6 space-y-5 flex flex-col justify-between shadow-sm h-full">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#1D2B3A] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#B25B3E]" />
                    Twin Telemetry
                  </h3>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8]">
                      <span className="text-[#5C5751]">Total Inquiries</span>
                      <span className="text-[#B25B3E] font-bold font-mono text-sm">{chatHistory.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8]">
                      <span className="text-[#5C5751]">AI Engine</span>
                      <span className="text-[#1D2B3A] font-medium">Gemini 1.5 / 3.5 Flash</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8]">
                      <span className="text-[#5C5751]">Max Output Cap</span>
                      <span className="text-[#1D2B3A] font-medium">500 tokens</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E1D8]">
                      <span className="text-[#5C5751]">Database</span>
                      <span className="text-[#1D2B3A] font-medium">MySQL (Sequelize)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5C5751]">Status</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Active & Live
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F3EFE9] border border-[#E5E1D8] flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#B25B3E] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5C5751] leading-relaxed">
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
