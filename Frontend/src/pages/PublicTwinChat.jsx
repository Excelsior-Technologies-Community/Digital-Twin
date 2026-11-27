import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';
import {
  Send,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  ArrowDown,
  ArrowUpRight,
  X,
  Briefcase,
  GraduationCap,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const DEFAULT_SAMPLE_QUESTIONS = [
  'Tell me about your background.',
  'What are your primary technical strengths?',
  'Describe a challenging engineering project you led.',
  'What is your preferred architectural philosophy?',
];

const buildCleanChatHistory = (messageList) => {
  if (!Array.isArray(messageList) || messageList.length === 0) {
    return [];
  }

  const pairs = [];
  let pendingUser = null;

  for (const msg of messageList) {
    if (!msg || msg.id === 'msg-welcome') continue;

    if (msg.isError) {
      pendingUser = null;
      continue;
    }

    const text = typeof msg.text === 'string' ? msg.text.trim() : '';
    if (!text) continue;

    if (msg.sender === 'user') {
      pendingUser = { role: 'user', text };
    } else if (msg.sender === 'twin' && pendingUser) {
      pairs.push(pendingUser, { role: 'model', text });
      pendingUser = null;
    }
  }

  return pairs.slice(-10);
};

const formatChatError = (err) => {
  const status = err?.response?.status;
  const backendMessage = err?.response?.data?.message || err?.response?.data?.error;

  if (status === 429) {
    const retryAfterRaw = err?.response?.headers?.['retry-after'];
    const retryAfterNum = Number.parseInt(retryAfterRaw, 10);
    if (Number.isFinite(retryAfterNum) && retryAfterNum > 0) {
      return `Rate limit reached. Please wait ${retryAfterNum}s before sending another question.`;
    }
    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage.trim();
    }
    return 'Too many messages sent too quickly. Please pause briefly and retry.';
  }

  if (status === 503) {
    return 'The AI twin engine is temporarily busy. Please wait a moment and retry.';
  }

  if (status === 504 || err?.code === 'ECONNABORTED') {
    return 'The response timed out. Please retry your question.';
  }

  if (!err?.response) {
    return 'Unable to reach the server. Check your connection and retry.';
  }

  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage.trim();
  }

  return 'Unable to generate a response right now. Please try again.';
};

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
  let list = parseJsonArray(rawSkills);
  if (list.length === 0 && typeof rawSkills === 'string') {
    const trimmed = rawSkills.trim();
    if (trimmed && !trimmed.startsWith('[')) {
      list = trimmed.split(',');
    }
  }
  return list.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
};

export default function PublicTwinChat() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [twinData, setTwinData] = useState(null);
  const [isLoadingTwin, setIsLoadingTwin] = useState(true);
  const [twinError, setTwinError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    if (!isCredentialsOpen) return;
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsCredentialsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isCredentialsOpen]);

  const scrollRef = useRef(null);
  const [fade, setFade] = useState({ left: false, right: true });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const hasDraggedRef = useRef(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setFade({
        left: scrollLeft > 1,
        right: scrollLeft < scrollWidth - clientWidth - 1,
      });
    }
  };

  const handleChatScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNear = scrollHeight - scrollTop - clientHeight < 120;
    isNearBottomRef.current = isNear;
    setShowScrollBottom(!isNear);
  };

  useEffect(() => {
    handleScroll();
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        handleScroll();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', handleScroll);
    return () => {
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = startScrollLeft - walk;
    handleScroll();
  };

  const scrollToBottom = (force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(true);
    }
  }, [messages, isTyping]);

  useEffect(() => {
    let isMounted = true;

    const fetchTwin = async () => {
      setIsLoadingTwin(true);
      setTwinError(null);
      try {
        const response = await api.get(`/twins/${slug}`);
        if (isMounted && response.data?.success) {
          const twin = response.data.twin;
          setTwinData(twin);
          setMessages([
            {
              id: 'msg-welcome',
              sender: 'twin',
              text: `Hello! I am ${twin.name}'s Digital Twin. I have been trained on their professional background, engineering achievements, and technical philosophy. Feel free to ask me anything about their experience or leadership!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching twin data:', err);
        const errMsg = err.response?.data?.message || 'Digital Twin not found or offline';
        if (isMounted) {
          setTwinError(errMsg);
        }
        toast.error(errMsg);
      } finally {
        if (isMounted) {
          setIsLoadingTwin(false);
        }
      }
    };

    if (slug) {
      fetchTwin();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isTyping || !inputMessage.trim()) return;
      handleSendMessage(e);
    }
  };

  const sendChatMessage = async (
    messageText,
    { isRetry = false, retryErrorId = null } = {}
  ) => {
    if (isTyping) return;
    const query = (messageText || '').trim();
    if (!query) return;

    const baseMessages =
      isRetry && retryErrorId
        ? messages.filter((m) => m.id !== retryErrorId)
        : messages;

    const chatHistory = buildCleanChatHistory(baseMessages);

    if (isRetry && retryErrorId) {
      setMessages(baseMessages);
    } else {
      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...baseMessages, userMsg]);
      setInputMessage('');
    }

    setIsTyping(true);
    isNearBottomRef.current = true;
    setShowScrollBottom(false);

    try {
      const response = await api.post(`/twins/${slug}/chat`, {
        message: query,
        history: chatHistory,
      });
      const aiReply =
        response.data?.reply || 'I apologize, I could not generate a response at this moment.';

      const twinMsg = {
        id: `twin-${Date.now()}`,
        sender: 'twin',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, twinMsg]);
    } catch (err) {
      console.error('Error sending message to twin:', err);
      const friendlyError = formatChatError(err);
      toast.error(friendlyError);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'twin',
        text: friendlyError,
        isError: true,
        failedQuery: query,
        errorStatus: err?.response?.status || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    sendChatMessage(inputMessage);
  };

  const skillsList = useMemo(
    () => parseVerifiedSkills(twinData?.skills),
    [twinData?.skills]
  );

  const verifiedExperience = useMemo(
    () => parseJsonArray(twinData?.experience).filter((item) => item && typeof item === 'object'),
    [twinData?.experience]
  );

  const verifiedEducation = useMemo(
    () => parseJsonArray(twinData?.education).filter((item) => item && typeof item === 'object'),
    [twinData?.education]
  );

  const suggestedQuestions = useMemo(() => {
    const prompts = [];
    const topSkill = skillsList[0];
    const secondSkill = skillsList[1];
    const latestRole = verifiedExperience[0];
    const primaryEdu = verifiedEducation[0];

    if (latestRole?.role) {
      const roleTitle = String(latestRole.role).trim();
      const company = latestRole.company ? String(latestRole.company).trim() : '';
      if (roleTitle) {
        prompts.push(
          company
            ? `Walk me through your measurable impact as ${roleTitle} at ${company}.`
            : `Walk me through your measurable impact as ${roleTitle}.`
        );
      }
    }

    if (topSkill && secondSkill) {
      prompts.push(`How have you applied ${topSkill} and ${secondSkill} in real projects?`);
    } else if (topSkill) {
      prompts.push(`How have you applied ${topSkill} in production projects?`);
    }

    if (verifiedExperience.length >= 2) {
      prompts.push('How did your responsibilities evolve across your past roles?');
    } else if (primaryEdu?.degree) {
      prompts.push(
        `How has your ${String(primaryEdu.degree).trim()} background shaped your technical approach?`
      );
    }

    if (topSkill) {
      prompts.push(
        `Tell me about a complex bottleneck you solved using ${topSkill} with STAR metrics.`
      );
    }

    const seen = new Set();
    const combined = [...prompts, ...DEFAULT_SAMPLE_QUESTIONS];
    const unique = [];

    for (const q of combined) {
      const key = q.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(q);
      }
      if (unique.length === 4) break;
    }

    return unique;
  }, [skillsList, verifiedExperience, verifiedEducation]);

  useEffect(() => {
    handleScroll();
  }, [suggestedQuestions]);

  const getInitials = (fullName) => {
    if (!fullName) return 'DT';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const canGoBackInternally =
    typeof window !== 'undefined' &&
    (window.history.state?.idx ?? 0) > 0 &&
    window.history.length > 1;

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-100 font-sans flex flex-col selection:bg-[#B25B3E] selection:text-[#FCFAF6] overflow-hidden transition-colors">
      <header className="flex-none border-b border-[#E5E1D8] dark:border-[#334155] bg-[#FCFAF6]/85 dark:bg-[#1E293B]/85 backdrop-blur-md sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-3.5 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
            {canGoBackInternally && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-[#FCFAF6] dark:bg-[#0F172A] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-200 transition-colors border border-[#E5E1D8] dark:border-[#334155] shadow-xs flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                title="Return to previous screen"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1D2B3A] dark:bg-[#B25B3E] text-white flex items-center justify-center font-serif font-semibold text-xs sm:text-sm shadow-xs select-none shrink-0">
                {getInitials(twinData?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-serif font-bold text-base sm:text-lg text-[#1D2B3A] dark:text-white tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
                  {isLoadingTwin ? (
                    'Connecting...'
                  ) : (
                    <>
                      <span className="truncate">{twinData?.name || 'Digital Twin'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#047857] dark:text-[#10B981] inline shrink-0" />
                    </>
                  )}
                </h1>
                <p className="text-[11px] sm:text-xs text-[#5C5751] dark:text-slate-400 flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#047857] dark:bg-[#10B981] animate-pulse motion-reduce:animate-none shrink-0" />
                  {twinData?.title ? (
                    <span className="font-medium text-[#1D2B3A] dark:text-slate-200 truncate">
                      {twinData.title}
                    </span>
                  ) : (
                    <span className="truncate">Active Persona</span>
                  )}
                  <span className="text-[#E5E1D8] dark:text-[#334155] hidden sm:inline shrink-0">&bull;</span>
                  <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest shrink-0">
                    {twinData?.tone || 'Professional'} Tone
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCredentialsOpen(true)}
              aria-label="View Verified Credentials"
              className="shrink-0 min-w-[44px] min-h-[44px] md:min-h-[36px] px-2.5 min-[400px]:px-3 sm:px-3.5 sm:py-1.5 bg-[#F3EFE9] hover:bg-[#E5E1D8] dark:bg-[#0F172A]/90 dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-slate-100 rounded-full text-xs font-sans font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] flex items-center justify-center gap-1.5 shadow-2xs border border-[#E5E1D8] dark:border-[#334155]/80 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
              <span className="hidden min-[400px]:inline sm:hidden">Docs</span>
              <span className="hidden sm:inline">View Verified Credentials</span>
            </button>
            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col min-h-0 overflow-hidden">
        {isLoadingTwin ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#1D2B3A]/20 dark:border-slate-700 border-t-[#B25B3E] animate-spin" />
            <p className="text-sm font-serif text-[#5C5751] dark:text-slate-400">
              Connecting to candidate profile...
            </p>
          </div>
        ) : twinError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-center justify-center text-[#B25B3E] dark:text-[#E07A5F] shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1D2B3A] dark:text-white">
                Digital Twin Unavailable
              </h2>
              <p className="text-sm text-[#5C5751] dark:text-slate-400 mt-1">{twinError}</p>
            </div>
            <button
              onClick={() => navigate('/studio')}
              aria-label="Back to Resume Studio"
              className="px-4 py-2.5 bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-semibold rounded-xl transition-all duration-150 ease-out active:scale-[0.98] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
            >
              Back to Resume Studio
            </button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-visible">
            <div className="relative flex-1 min-h-0 flex flex-col">
              <div
                ref={messagesContainerRef}
                onScroll={handleChatScroll}
                className="flex-1 overflow-y-auto scroll-smooth space-y-5 px-4 sm:px-6 py-4"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : {
                                opacity: 0,
                                x: isUser ? 12 : -12,
                                y: 10,
                                scale: 0.98
                              }
                        }
                        animate={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : {
                                opacity: 1,
                                x: 0,
                                y: 0,
                                scale: 1
                              }
                        }
                        transition={
                          shouldReduceMotion
                            ? { duration: 0.15 }
                            : {
                                type: 'spring',
                                stiffness: 380,
                                damping: 30,
                                mass: 0.8
                              }
                        }
                        className={`flex w-full ${
                          isUser ? 'justify-end' : 'justify-start items-start gap-2.5 sm:gap-3'
                        }`}
                      >
                        {isUser && (
                          <div className="bg-[#B25B3E] text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[75%] min-w-0">
                            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                              {msg.text}
                            </p>
                            <span className="text-[10px] text-white/75 font-mono block mt-1.5 text-right">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}

                        {!isUser && (
                          <>
                            <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-serif font-semibold text-xs bg-[#1D2B3A] dark:bg-[#B25B3E] text-white select-none mt-0.5 shadow-xs">
                              {getInitials(twinData?.name)}
                            </div>
                            <div
                              className={`bg-[#FCFAF6] dark:bg-[#1E293B] border text-[#1D2B3A] dark:text-slate-100 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[75%] min-w-0 ${
                                msg.isError
                                  ? 'border-[#B25B3E]/40 dark:border-[#E07A5F]/40'
                                  : 'border-[#E5E1D8] dark:border-[#334155]/80'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-[#E5E1D8]/80 dark:border-[#334155]/80">
                                {msg.isError ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#B25B3E]/10 dark:bg-[#E07A5F]/15 font-mono font-bold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F]">
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                    {msg.errorStatus === 429
                                      ? 'Rate Limited'
                                      : msg.errorStatus === 504
                                        ? 'Request Timeout'
                                        : 'Delivery Paused'}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F]">
                                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                    Verified AI Representative
                                  </span>
                                )}
                                <span className="text-[10px] text-[#8A847C] dark:text-slate-400 font-mono shrink-0">
                                  {msg.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-[#1D2B3A] dark:text-slate-100 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {msg.text}
                              </p>
                              {msg.isError && msg.failedQuery && (
                                <div className="mt-3 pt-2.5 border-t border-[#E5E1D8]/80 dark:border-[#334155]/80 flex items-center justify-start">
                                  <button
                                    type="button"
                                    disabled={isTyping}
                                    onClick={() =>
                                      sendChatMessage(msg.failedQuery, {
                                        isRetry: true,
                                        retryErrorId: msg.id,
                                      })
                                    }
                                    className="bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-medium min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                                    <span>Retry Question</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      key="typing-indicator"
                      initial={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, x: -12, y: 10, scale: 0.98 }
                      }
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, x: 0, y: 0, scale: 1 }
                      }
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
                      }
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.15 }
                          : {
                              type: 'spring',
                              stiffness: 380,
                              damping: 30,
                              mass: 0.8
                            }
                      }
                      className="flex items-start gap-2.5 sm:gap-3 w-full justify-start"
                    >
                      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-serif font-semibold text-xs bg-[#1D2B3A] dark:bg-[#B25B3E] text-white select-none mt-0.5 shadow-xs">
                        {getInitials(twinData?.name)}
                      </div>
                      <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155]/80 text-[#1D2B3A] dark:text-slate-100 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%] sm:max-w-md">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] mb-1.5 pb-1.5 border-b border-[#E5E1D8]/80 dark:border-[#334155]/80">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified AI Representative</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#5C5751] dark:text-slate-300">
                          <div className="flex gap-1.5 items-center py-0.5">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#B25B3E] dark:bg-[#E07A5F]"
                                animate={{
                                  y: [0, -4, 0],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                  delay: i * 0.16
                                }}
                              />
                            ))}
                          </div>
                          <span className="font-serif italic text-xs text-[#5C5751] dark:text-slate-300">
                            Formulating STAR-method response...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              <AnimatePresence>
                {showScrollBottom && (
                  <motion.button
                    type="button"
                    onClick={() => scrollToBottom(true)}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.2 }}
                    aria-label="Scroll to latest messages"
                    className="absolute right-4 sm:right-6 bottom-4 z-20 w-11 h-11 rounded-full bg-[#FCFAF6] dark:bg-[#1E293B] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] shadow-md flex items-center justify-center hover:bg-[#F3EFE9] dark:hover:bg-[#334155] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <footer className="shrink-0 overflow-visible border-t border-[#E5E1D8]/80 dark:border-[#334155]/80 px-4 sm:px-6 pt-3 pb-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] space-y-2">
              <div>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                  <span>Suggested Recruiter Inquiries</span>
                </span>

                <div className="relative w-full [mask-image:linear-gradient(to_right,black_0%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_92%,transparent_100%)]">
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F3EFE9] dark:from-[#0F172A] to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
                      fade.left ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`flex flex-nowrap overflow-x-auto scroll-smooth snap-x snap-mandatory w-full gap-2 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1.5 px-1 -mx-1 pr-6 ${
                      isDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab'
                    }`}
                  >
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        title={q}
                        disabled={isTyping}
                        onClick={() => {
                          if (hasDraggedRef.current || isTyping) return;
                          sendChatMessage(q);
                        }}
                        className="group shrink-0 snap-start whitespace-nowrap inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-[36px] max-w-[260px] min-[400px]:max-w-[300px] sm:max-w-none bg-[#FCFAF6] dark:bg-[#1E293B] text-[#1D2B3A] dark:text-slate-200 hover:bg-[#1D2B3A] dark:hover:bg-[#334155] hover:text-[#FCFAF6] dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-[#E5E1D8] dark:border-[#334155]/80 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all rounded-full px-3.5 py-1.5 text-xs shadow-xs active:scale-95 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                      >
                        <span className="block truncate min-w-0">{q}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[#B25B3E]/70 dark:text-[#E07A5F]/80 group-hover:text-[#B25B3E] dark:group-hover:text-[#E07A5F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150" />
                      </button>
                    ))}
                  </div>

                  <div
                    className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F3EFE9] dark:from-[#0F172A] to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
                      fade.right ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </div>

              <form onSubmit={handleSendMessage} aria-busy={isTyping} className="relative">
                <div className="flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200 bg-[#FCFAF6] border border-[#E5E1D8] shadow-[0_2px_8px_-2px_rgba(29,43,58,0.06)] focus-within:border-[#B25B3E] focus-within:ring-2 focus-within:ring-[#B25B3E]/20 focus-within:shadow-[0_4px_14px_-4px_rgba(29,43,58,0.12)] dark:bg-[#1E293B]/95 dark:border-[#334155]/80 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_2px_8px_-2px_rgba(0,0,0,0.35)] dark:focus-within:border-[#E07A5F]/75 dark:focus-within:bg-[#1E293B] dark:focus-within:ring-2 dark:focus-within:ring-[#E07A5F]/20 dark:focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_6px_18px_-6px_rgba(0,0,0,0.55)]">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isTyping ? 'Twin is thinking...' : 'Ask your Twin...'}
                    disabled={isTyping}
                    className="composer-input flex-1 min-w-0 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-sm text-[#1D2B3A] dark:text-slate-100 placeholder:text-[#8A847C] dark:placeholder:text-slate-400/80 px-3 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputMessage.trim()}
                    aria-busy={isTyping}
                    aria-label="Send question to Digital Twin"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-sans font-semibold transition-all duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] bg-[#B25B3E] hover:bg-[#9E4D32] text-white shadow-sm active:scale-[0.97] disabled:opacity-50 disabled:hover:bg-[#B25B3E] disabled:active:scale-100 disabled:cursor-not-allowed"
                  >
                    {isTyping ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{isTyping ? 'Thinking...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            </footer>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isCredentialsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsCredentialsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px]"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="verified-credentials-title"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.15 }
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
              className="fixed top-0 right-0 z-50 h-[100dvh] w-full max-w-[92vw] sm:max-w-md bg-[#FCFAF6] dark:bg-[#1E293B] border-l border-[#E5E1D8] dark:border-[#334155] shadow-2xl dark:shadow-[inset_1px_0_0_0_rgba(255,255,255,0.06)] flex flex-col"
            >
              <div className="px-5 py-4 border-b border-[#E5E1D8] dark:border-[#334155] flex items-center justify-between gap-3 bg-[#FCFAF6] dark:bg-[#1E293B]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-serif font-semibold text-xs bg-[#1D2B3A] dark:bg-[#B25B3E] text-white select-none shadow-xs">
                    {getInitials(twinData?.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] block">
                      Verified Credentials
                    </span>
                    <h2
                      id="verified-credentials-title"
                      className="text-base font-serif font-bold text-[#1D2B3A] dark:text-white truncate"
                    >
                      {twinData?.name || 'Digital Twin'}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCredentialsOpen(false)}
                  aria-label="Close credentials drawer"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#5C5751] hover:text-[#1D2B3A] dark:text-slate-400 dark:hover:text-white hover:bg-[#E5E1D8]/60 dark:hover:bg-[#334155] transition-all duration-150 active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block mb-2">
                    Executive Persona Bio
                  </span>
                  <div className="bg-[#F3EFE9]/70 dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155]/80 rounded-xl p-4 text-sm leading-relaxed text-[#1D2B3A] dark:text-slate-200 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {twinData?.bio || 'No candidate bio information has been provided for this persona.'}
                  </div>
                </div>
                {twinData?.title && (
                  <div>
                    <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block mb-2">
                      Professional Title
                    </span>
                    <span className="inline-block max-w-full bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155]/80 text-[#1D2B3A] dark:text-slate-100 text-xs font-sans font-medium px-3 py-1.5 rounded-full break-words [overflow-wrap:anywhere]">
                      {twinData.title}
                    </span>
                  </div>
                )}
                {twinData?.tone && (
                  <div>
                    <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block mb-2">
                      Persona Speaking Tone
                    </span>
                    <span className="inline-block max-w-full bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155]/80 text-[#1D2B3A] dark:text-slate-100 text-xs font-sans font-medium px-3 py-1.5 rounded-full break-words [overflow-wrap:anywhere]">
                      {twinData.tone} Tone
                    </span>
                  </div>
                )}
                {skillsList.length > 0 && (
                  <div>
                    <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 block mb-2">
                      Verified Technical Competencies ({skillsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-[#F3EFE9] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-[#334155]/80 text-[#1D2B3A] dark:text-slate-100 text-xs font-sans px-2.5 py-1 rounded-lg max-w-full break-words [overflow-wrap:anywhere]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {verifiedExperience.length > 0 && (
                  <div>
                    <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 flex items-center gap-1.5 mb-3">
                      <Briefcase className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                      <span>Experience ({verifiedExperience.length})</span>
                    </span>
                    <div className="pl-4 border-l border-[#E5E1D8] dark:border-[#334155] space-y-4">
                      {verifiedExperience.map((exp, idx) => (
                        <div key={`${exp.role || exp.title || 'exp'}-${idx}`} className="relative min-w-0">
                          <span
                            aria-hidden="true"
                            className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#B25B3E] dark:bg-[#E07A5F] ring-4 ring-[#FCFAF6] dark:ring-[#1E293B]"
                          />
                          <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                            <p className="font-semibold text-xs sm:text-sm text-[#1D2B3A] dark:text-white leading-snug min-w-0 break-words [overflow-wrap:anywhere]">
                              {exp.role || exp.title || 'Experience Role'}
                            </p>
                            {exp.duration && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-slate-300 border border-[#E5E1D8] dark:border-[#334155]/80 shrink-0">
                                {exp.duration}
                              </span>
                            )}
                          </div>
                          {exp.company && (
                            <p className="text-xs font-medium text-[#B25B3E] dark:text-[#E07A5F] mt-0.5 break-words [overflow-wrap:anywhere]">
                              {exp.company}
                            </p>
                          )}
                          {exp.description && (
                            <p className="text-xs leading-relaxed text-[#5C5751] dark:text-slate-300 mt-1.5 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {verifiedEducation.length > 0 && (
                  <div>
                    <span className="font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8A847C] dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                      <span>Education ({verifiedEducation.length})</span>
                    </span>
                    <div className="space-y-2.5">
                      {verifiedEducation.map((edu, idx) => (
                        <div
                          key={`${edu.degree || 'edu'}-${idx}`}
                          className="bg-[#F3EFE9]/70 dark:bg-[#0F172A]/70 border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-3.5 min-w-0"
                        >
                          <p className="font-serif font-bold text-xs sm:text-sm text-[#1D2B3A] dark:text-white leading-snug break-words [overflow-wrap:anywhere]">
                            {edu.degree || 'Academic Credential'}
                          </p>
                          {edu.institution && (
                            <p className="text-xs text-[#5C5751] dark:text-slate-300 mt-0.5 break-words [overflow-wrap:anywhere]">
                              {edu.institution}
                            </p>
                          )}
                          {edu.year && (
                            <span className="inline-block mt-2 font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#FCFAF6] dark:bg-[#1E293B] text-[#8A847C] dark:text-slate-400 border border-[#E5E1D8] dark:border-[#334155]/80">
                              {edu.year}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3.5 border-t border-[#E5E1D8] dark:border-[#334155]/70 bg-[#FCFAF6] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5751] dark:text-slate-400">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
                  <span className="truncate">Grounded in Verified Candidate Resume</span>
                </div>
                {twinData?.publicSlug && (
                  <span className="font-mono text-[10px] text-[#B25B3E] dark:text-[#E07A5F] break-all min-w-0">
                    {twinData.publicSlug}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
