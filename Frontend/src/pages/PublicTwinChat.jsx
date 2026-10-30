import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Send,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function PublicTwinChat() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [twinData, setTwinData] = useState(null);
  const [isLoadingTwin, setIsLoadingTwin] = useState(true);
  const [twinError, setTwinError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
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

  useEffect(() => {
    handleScroll();
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY !== 0) {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch twin data by public slug on mount
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
          // Initialize welcome message from the twin
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
        if (isMounted) {
          setTwinError(err.response?.data?.message || 'Digital Twin not found or offline');
        }
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

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const query = inputMessage.trim();
    if (!query || isTyping) return;

    // Map existing UI messages state into history array for multi-turn context
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

  const sampleQuestions = [
    'Tell me about your background.',
    'What are your primary technical strengths?',
    'Describe a challenging engineering project you led.',
    'What is your preferred architectural philosophy?',
  ];

  const getInitials = (fullName) => {
    if (!fullName) return 'MP';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F3EFE9] text-[#1D2B3A] font-sans flex flex-col selection:bg-[#B25B3E] selection:text-[#FCFAF6] overflow-hidden">
      {/* Editorial Header */}
      <header className="border-b border-[#E5E1D8] bg-[#FCFAF6]/80 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-[#FCFAF6] hover:bg-[#E5E1D8] text-[#1D2B3A] transition-colors border border-[#E5E1D8] shadow-xs flex items-center justify-center shrink-0"
              title="Return to resume"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1D2B3A] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-sm select-none shrink-0">
                {getInitials(twinData?.name)}
              </div>
              <div className="min-w-0">
                <h1 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#1D2B3A] tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 truncate">
                  {isLoadingTwin ? (
                    'Connecting...'
                  ) : (
                    <>
                      <span className="truncate">{twinData?.name || 'MANAV PATEL'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 inline shrink-0" />
                    </>
                  )}
                </h1>
                <p className="text-[11px] sm:text-xs text-[#5C5751] flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                  <span>Active Persona</span>
                  <span className="text-[#E5E1D8]">&bull;</span>
                  <span>Gemini AI</span>
                  <span className="text-[#E5E1D8] hidden xs:inline">&bull;</span>
                  <span className="hidden xs:inline">{twinData?.tone || 'Professional'} Tone</span>
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-xs font-serif text-[#1D2B3A] bg-[#FCFAF6] border border-[#E5E1D8] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B25B3E]" />
              Verified Persona
            </span>
          </div>
        </div>
      </header>

      {/* Main Chat Terminal Window */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col p-3 sm:p-4 md:p-6 overflow-hidden">
        {isLoadingTwin ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#1D2B3A]/20 border-t-[#B25B3E] animate-spin"></div>
            <p className="text-sm font-serif text-[#5C5751]">Connecting to candidate profile...</p>
          </div>
        ) : twinError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FCFAF6] border border-[#E5E1D8] flex items-center justify-center text-[#B25B3E] shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1D2B3A]">Digital Twin Unavailable</h2>
              <p className="text-sm text-[#5C5751] mt-1">{twinError}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-[#1D2B3A] hover:bg-[#2A3F55] text-[#FCFAF6] text-xs font-semibold rounded-xl border border-[#1D2B3A] transition-colors shadow-xs"
            >
              Back to Resume Studio
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-2 pb-4 scrollbar-thin scrollbar-thumb-[#E5E1D8]">
              {/* Collapsible Candidate Resume Data Accordion */}
              {twinData?.bio && (
                <details className="mb-6 p-4 border border-[#E5E1D8] bg-[#FCFAF6] rounded-xl cursor-pointer group">
                  <summary className="font-bold text-[#1D2B3A] font-sans outline-none">
                    View Candidate Resume Data
                  </summary>
                  <div className="mt-3 text-sm text-[#1D2B3A]/80 whitespace-pre-wrap max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {twinData.bio}
                  </div>
                </details>
              )}

              {/* Message Items */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-start' : 'items-end'
                  }`}
                >
                  {/* Visitor Messages: Inbound on Left */}
                  {msg.sender === 'user' && (
                    <div className="bg-[#FCFAF6] border border-[#E5E1D8] text-[#1D2B3A] rounded-2xl rounded-tl-sm p-3.5 sm:p-4 shadow-sm max-w-[88%] sm:max-w-xl md:max-w-2xl">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-[#B25B3E] font-medium text-xs">
                          Recruiter (visitor)
                        </span>
                        <span className="text-[10px] text-[#4A453F] font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-[#1D2B3A] leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  )}

                  {/* Proxy Answers: Outbound on Right */}
                  {msg.sender === 'twin' && (
                    <div
                      className={`bg-[#1D2B3A] text-[#FCFAF6] rounded-2xl rounded-tr-sm p-4 sm:p-5 shadow-md max-w-[88%] sm:max-w-xl md:max-w-2xl ${
                        msg.isError ? 'border-2 border-[#B25B3E]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-[#FCFAF6]/15">
                        <span className="text-xs font-serif font-semibold text-[#FCFAF6] tracking-wide">
                          {twinData?.name || 'Candidate'}'s Proxy (candidate)
                        </span>
                        <span className="bg-[#FCFAF6]/15 text-[#EFE8DD] border border-[#FCFAF6]/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                          PROXY ANSWER
                        </span>
                      </div>
                      <p className="text-sm text-[#FCFAF6]/95 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                      <span className="text-[10px] text-[#FCFAF6]/60 font-mono block mt-2.5 text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col items-end">
                  <div className="bg-[#1D2B3A] text-[#FCFAF6] rounded-2xl rounded-tr-sm p-3.5 sm:p-4 shadow-md max-w-[88%] sm:max-w-md">
                    <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-[#FCFAF6]/15">
                      <span className="text-xs font-serif font-semibold text-[#FCFAF6]/90">
                        {twinData?.name || 'Candidate'}'s Proxy
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#EFE8DD] bg-[#FCFAF6]/10 px-1.5 py-0.5 rounded">
                        REASONING
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#EFE8DD]/80">
                      <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B25B3E] animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B25B3E] animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B25B3E] animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                      <span className="font-serif italic text-xs text-[#FCFAF6]/80">
                        Formulating STAR-method response...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Dynamic Prompt Pills */}
            <div className="pt-2 pb-2.5 border-t border-[#E5E1D8]/60 relative">
              <span className="text-[11px] font-serif font-bold text-[#5C5751] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#B25B3E]" />
                Suggested Recruiter Inquiries
              </span>

              {/* Scrollable Carousel Wrapper with Dynamic Dual-Sided Gradient Fade Masks */}
              <div className="relative w-full">
                {/* Left Fade */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
                    fade.left ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Horizontal Scroll Track with Drag-to-Scroll Support */}
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className={`flex flex-nowrap overflow-x-auto w-full gap-2 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 ${
                    isDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-smooth'
                  }`}
                >
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (hasDraggedRef.current) return;
                        setInputMessage(q);
                      }}
                      className="shrink-0 whitespace-nowrap bg-[#FCFAF6] text-[#1D2B3A] hover:bg-[#1D2B3A] hover:text-[#FCFAF6] border border-[#E5E1D8] transition-all rounded-full px-3.5 py-1.5 text-xs shadow-xs active:scale-95 cursor-pointer select-none"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Right Fade */}
                <div
                  className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
                    fade.right ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendMessage} className="relative mt-1">
              <div className="flex items-center bg-[#FCFAF6] border border-[#E5E1D8] focus-within:border-[#1D2B3A] focus-within:ring-1 focus-within:ring-[#1D2B3A]/20 rounded-2xl p-2 shadow-sm transition-all">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask ${twinData?.name ? twinData.name.split(' ')[0] : 'the candidate'} about their experience...`}
                  disabled={isTyping}
                  className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-sm text-[#1D2B3A] placeholder-[#5C5751]/60 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  aria-label="Send question to Digital Twin"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] min-w-[42px] sm:min-w-fit px-3.5 sm:px-4 py-2.5 bg-[#B25B3E] hover:bg-[#9C4E34] disabled:bg-[#E5E1D8] disabled:text-[#5C5751] text-[#FCFAF6] text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-xs disabled:shadow-none shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
