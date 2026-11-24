import React, { useState, useEffect, useRef } from 'react';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

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

  const sendChatMessage = async (messageText) => {
    if (isTyping) return;
    const query = (messageText || '').trim();
    if (!query) return;

    const chatHistory = messages
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    isNearBottomRef.current = true;
    setShowScrollBottom(false);

    try {
      const response = await api.post(`/twins/${slug}/chat`, {
        message: query,
        history: chatHistory,
      });
      const aiReply = response.data?.reply || 'I apologize, I could not generate a response at this moment.';

      const twinMsg = {
        id: `twin-${Date.now()}`,
        sender: 'twin',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, twinMsg]);
    } catch (err) {
      console.error('Error sending message to twin:', err);
      toast.error('Failed to reach AI reasoning engine. Please try asking again.');
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'twin',
        text: 'Sorry, I encountered an issue connecting to my reasoning engine. Please try asking again.',
        isError: true,
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

  const sampleQuestions = [
    'Tell me about your background.',
    'What are your primary technical strengths?',
    'Describe a challenging engineering project you led.',
    'What is your preferred architectural philosophy?',
  ];

  const skillsList = Array.isArray(twinData?.skills)
    ? twinData.skills
    : typeof twinData?.skills === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(twinData.skills);
            if (Array.isArray(parsed)) return parsed;
          } catch (_) {}
          return twinData.skills.split(',').map((s) => s.trim()).filter(Boolean);
        })()
      : [];

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
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-gray-100 font-sans flex flex-col selection:bg-[#B25B3E] selection:text-[#FCFAF6] overflow-hidden transition-colors">
      <header className="border-b border-[#E5E1D8] dark:border-[#334155] bg-[#FCFAF6]/80 dark:bg-[#1E293B]/80 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {canGoBackInternally && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-[#FCFAF6] dark:bg-[#1E293B] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-gray-200 transition-colors border border-[#E5E1D8] dark:border-[#334155] shadow-xs flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                title="Return to previous screen"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1D2B3A] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-sm select-none shrink-0">
                {getInitials(twinData?.name)}
              </div>
              <div className="min-w-0">
                <h1 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#1D2B3A] dark:text-white tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 truncate">
                  {isLoadingTwin ? (
                    'Connecting...'
                  ) : (
                    <>
                      <span className="truncate">{twinData?.name || 'Digital Twin'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 inline shrink-0" />
                    </>
                  )}
                </h1>
                <p className="text-[11px] sm:text-xs text-[#5C5751] dark:text-gray-400 flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                  <span>Active Persona</span>
                  <span className="text-[#E5E1D8] dark:text-[#334155]">&bull;</span>
                  <span>Gemini AI</span>
                  <span className="text-[#E5E1D8] dark:text-[#334155] hidden xs:inline">&bull;</span>
                  <span className="hidden xs:inline">{twinData?.tone || 'Professional'} Tone</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCredentialsOpen(true)}
              aria-label="View Verified Credentials"
              className="bg-[#F3EFE9] hover:bg-[#E8E2D9] dark:bg-[#0F172A]/80 dark:hover:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-100 rounded-full px-3 py-1.5 text-xs font-sans font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] flex items-center gap-1.5 shadow-2xs border border-[#E5E1D8]/60 dark:border-transparent cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F] shrink-0" />
              <span className="hidden sm:inline">View Verified Credentials</span>
              <span className="inline sm:hidden">Credentials</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col min-h-0 overflow-hidden">
        {isLoadingTwin ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#1D2B3A]/20 dark:border-gray-700 border-t-[#B25B3E] animate-spin"></div>
            <p className="text-sm font-serif text-[#5C5751] dark:text-gray-400">Connecting to candidate profile...</p>
          </div>
        ) : twinError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] flex items-center justify-center text-[#B25B3E] shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1D2B3A] dark:text-white">Digital Twin Unavailable</h2>
              <p className="text-sm text-[#5C5751] dark:text-gray-400 mt-1">{twinError}</p>
            </div>
            <button
              onClick={() => navigate('/studio')}
              aria-label="Back to Resume Studio"
              className="px-4 py-2 bg-[#1D2B3A] dark:bg-[#334155] hover:bg-[#2A3F55] dark:hover:bg-[#475569] text-[#FCFAF6] text-xs font-semibold rounded-xl border border-[#1D2B3A] dark:border-[#334155] transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
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
                          <div className="bg-[#B25B3E] text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[75%]">
                            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </p>
                            <span className="text-[10px] text-white/75 font-mono block mt-1.5 text-right">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}

                        {!isUser && (
                          <>
                            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-sans font-semibold text-xs bg-[#1D2B3A] text-[#FCFAF6] dark:bg-[#0F172A] dark:text-[#F3EFE9] ring-1 ring-[#B25B3E]/30 select-none mt-0.5 shadow-xs">
                              {getInitials(twinData?.name)}
                            </div>
                            <div
                              className={`bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-transparent text-[#1D2B3A] dark:text-slate-100 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[75%] ${
                                msg.isError ? 'border-2 border-[#B25B3E]' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-[#E5E1D8]/60 dark:border-white/10">
                                <span className="flex items-center gap-1.5 font-sans font-semibold text-[10px] uppercase tracking-wider text-[#B25B3E] dark:text-[#E07A5F]">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Verified AI Representative
                                </span>
                                <span className="text-[10px] text-[#5C5751] dark:text-gray-400 font-mono">
                                  {msg.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-[#1D2B3A] dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                              </p>
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
                      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-sans font-semibold text-xs bg-[#1D2B3A] text-[#FCFAF6] dark:bg-[#0F172A] dark:text-[#F3EFE9] ring-1 ring-[#B25B3E]/30 select-none mt-0.5 shadow-xs">
                        {getInitials(twinData?.name)}
                      </div>
                      <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-transparent text-[#1D2B3A] dark:text-slate-100 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%] sm:max-w-md">
                        <div className="flex items-center gap-1.5 font-sans font-semibold text-[10px] uppercase tracking-wider text-[#B25B3E] dark:text-[#E07A5F] mb-1.5 pb-1.5 border-b border-[#E5E1D8]/60 dark:border-white/10">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified AI Representative</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#5C5751] dark:text-gray-300">
                          <div className="flex gap-1.5 items-center py-0.5">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#B25B3E]"
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
                          <span className="font-serif italic text-xs text-[#5C5751] dark:text-gray-300">
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
                    className="absolute right-4 sm:right-6 bottom-4 z-20 w-9 h-9 rounded-full bg-white dark:bg-[#1E293B] text-[#B25B3E] border border-[#B25B3E]/40 shadow-md flex items-center justify-center hover:bg-[#F3EFE9] dark:hover:bg-[#334155] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <footer className="shrink-0 overflow-visible border-t border-[#E5E1D8]/60 dark:border-[#334155]/60 px-4 sm:px-6 pt-3 pb-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] space-y-2">
              <div>
                <span className="text-[11px] font-serif font-bold text-[#5C5751] dark:text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#B25B3E]" />
                  Suggested Recruiter Inquiries
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
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isTyping}
                        onClick={() => {
                          if (hasDraggedRef.current || isTyping) return;
                          sendChatMessage(q);
                        }}
                        className="group shrink-0 snap-start whitespace-nowrap inline-flex items-center gap-1.5 bg-[#FCFAF6] dark:bg-[#1E293B] text-[#1D2B3A] dark:text-gray-200 hover:bg-[#1D2B3A] dark:hover:bg-[#334155] hover:text-[#FCFAF6] dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-[#E5E1D8] dark:border-[#334155] transition-all rounded-full px-3.5 py-1.5 text-xs shadow-xs active:scale-95 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                      >
                        <span>{q}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[#B25B3E]/70 group-hover:text-[#B25B3E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150" />
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
                <div className="flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200 bg-[#FCFAF6] border border-[#E5E1D8] shadow-[0_2px_8px_-2px_rgba(29,43,58,0.06)] focus-within:border-[#1D2B3A]/45 focus-within:ring-2 focus-within:ring-[#1D2B3A]/[0.08] focus-within:shadow-[0_4px_14px_-4px_rgba(29,43,58,0.12)] dark:bg-[#1E293B]/95 dark:border-[#334155]/80 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_2px_8px_-2px_rgba(0,0,0,0.35)] dark:focus-within:border-slate-400/50 dark:focus-within:bg-[#1E293B] dark:focus-within:ring-2 dark:focus-within:ring-white/[0.08] dark:focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_6px_18px_-6px_rgba(0,0,0,0.55)]">
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
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-sans font-semibold transition-all duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${
                      isTyping || !inputMessage.trim()
                        ? 'bg-[#E8E2D9] text-[#8A847C] dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-[#B25B3E] hover:bg-[#9E4D32] text-white shadow-sm active:scale-[0.97]'
                    }`}
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
              className="fixed top-0 right-0 z-50 h-[100dvh] w-full max-w-md bg-[#FCFAF6] dark:bg-[#1E293B] border-l border-[#E5E1D8] dark:border-[#334155] shadow-2xl dark:shadow-[inset_1px_0_0_0_rgba(255,255,255,0.06)] flex flex-col"
            >
              <div className="px-5 py-4 border-b border-[#E5E1D8] dark:border-[#334155] flex items-center justify-between gap-3 bg-[#FCFAF6] dark:bg-[#1E293B]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-sans font-semibold text-xs bg-[#1D2B3A] text-[#FCFAF6] dark:bg-[#0F172A] dark:text-[#F3EFE9] ring-1 ring-[#B25B3E]/30 select-none shadow-xs">
                    {getInitials(twinData?.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] block">
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
                  className="min-w-[36px] min-h-[36px] p-2 rounded-lg text-[#5C5751] hover:text-[#1D2B3A] dark:text-gray-400 dark:hover:text-white hover:bg-[#E5E1D8]/60 dark:hover:bg-[#334155] transition-all duration-150 active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <span className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2">
                    Executive Persona Bio
                  </span>
                  <div className="bg-[#F3EFE9]/70 dark:bg-[#0F172A]/70 rounded-xl p-4 text-sm leading-relaxed text-[#1D2B3A] dark:text-slate-200 whitespace-pre-wrap">
                    {twinData?.bio || 'No candidate bio information has been provided for this persona.'}
                  </div>
                </div>
                {twinData?.title && (
                  <div>
                    <span className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2">
                      Professional Title
                    </span>
                    <span className="inline-block bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-100 text-xs font-sans font-medium px-3 py-1.5 rounded-full">
                      {twinData.title}
                    </span>
                  </div>
                )}
                {twinData?.tone && (
                  <div>
                    <span className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2">
                      Persona Speaking Tone
                    </span>
                    <span className="inline-block bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-100 text-xs font-sans font-medium px-3 py-1.5 rounded-full">
                      {twinData.tone} Tone
                    </span>
                  </div>
                )}
                {skillsList.length > 0 && (
                  <div>
                    <span className="font-sans font-semibold text-[11px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-2">
                      Verified Technical Competencies ({skillsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-100 text-xs font-sans px-2.5 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3.5 border-t border-[#E5E1D8] dark:border-[#334155]/70 bg-[#FCFAF6] dark:bg-[#1E293B] flex items-center justify-between text-xs text-[#5C5751] dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#B25B3E]" />
                  <span>Grounded in Verified Candidate Resume</span>
                </div>
                {twinData?.publicSlug && (
                  <span className="font-mono text-[10px] text-[#B25B3E] dark:text-[#E07A5F]">
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
