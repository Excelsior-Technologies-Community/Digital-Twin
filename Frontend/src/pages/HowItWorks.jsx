import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  Cpu,
  Radio,
  FileText,
  UserCheck,
  Search,
  ShieldCheck,
  PanelRightOpen,
  ChevronDown,
  Layers,
  Database
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import MarketingLayout from '../components/MarketingLayout';

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const [activePerspective, setActivePerspective] = useState('candidates');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const candidateSteps = [
    {
      num: '01',
      icon: UploadCloud,
      title: 'Upload & Configure',
      description: 'Drop any standard PDF resume up to 10MB. Select your speaking persona tone (Professional, Direct & Technical, Confident & Executive, or Friendly & Conversational) to calibrate dialogue posture.'
    },
    {
      num: '02',
      icon: Cpu,
      title: 'Semantic Gemini Extraction',
      description: 'The ingestion pipeline parses raw document vectors into structured technical competencies, chronological achievements, leadership highlights, and a collision-free public URL slug.'
    },
    {
      num: '03',
      icon: Radio,
      title: 'Command Center & 3D Graph',
      description: 'Explore your interactive 3D competency graph mapped across engineering domains. Monitor inbound recruiter interactions live through the synchronized Activity Feed.'
    },
    {
      num: '04',
      icon: FileText,
      title: 'Customize & Export A4',
      description: 'Switch between Modern and Classic templates, adjust executive accent palettes, live quick-edit your executive summary and key highlights, and generate vector-perfect printable A4 documents.'
    }
  ];

  const recruiterSteps = [
    {
      num: '01',
      icon: UserCheck,
      title: 'Open Direct Twin Link',
      description: 'Access any candidate’s verified persona via their public URL. No authentication, sign-ups, or recruiter platform paywalls required to begin evaluation.'
    },
    {
      num: '02',
      icon: Search,
      title: 'One-Click Guided Inquiries',
      description: 'Trigger fast inquiries using pre-curated chips or ask targeted architectural, leadership, and system design questions directly through the borderless composer.'
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: 'STAR-Grounded Responses',
      description: 'Every statement is structured through Situation, Task, Action, and Result formatting, rooted deterministically in verified resume text without hallucinations.'
    },
    {
      num: '04',
      icon: PanelRightOpen,
      title: 'Inspect Verified Credentials',
      description: 'Slide open the Verified Credentials drawer at any point during dialogue to cross-reference the candidate’s executive bio and technical competencies in real time.'
    }
  ];

  const pipelineNodes = [
    {
      label: 'Input Stage',
      title: 'PDF Document Buffer',
      tech: 'Multer memory storage & pdf-parse vector stream'
    },
    {
      label: 'Reasoning Engine',
      title: 'Gemini AI Synthesis',
      tech: 'Structured JSON schema parsing & STAR prompt grounding'
    },
    {
      label: 'Data Persistence',
      title: 'MySQL Relational Store',
      tech: 'Sequelize twin records, analytics & conversation history'
    },
    {
      label: 'Interactive Surface',
      title: '3D WebGL & Chat Persona',
      tech: 'Three.js force graph clusters & live recruiter dialogue'
    }
  ];

  const faqs = [
    {
      question: 'How does the AI avoid making up skills or fake metrics?',
      answer: 'The system uses strict instruction boundary grounding. When synthesizing responses, the Gemini model is restricted strictly to the candidate’s verified resume facts. If an inquiry asks about engineering skills or experiences not documented in the dossier, the digital twin candidly clarifies that the domain is outside the candidate’s documented background.'
    },
    {
      question: 'Do recruiters need to create an account to interview my Digital Twin?',
      answer: 'No. Each activated twin generates a unique public slug (such as /twin/candidate-name-1234). Recruiters and hiring managers can open the link directly on desktop or mobile, interact with the AI representative, and inspect verified credentials without registering or logging in.'
    },
    {
      question: 'Does the 3D Skill Graph work for non-technical resumes too?',
      answer: 'Yes. While the spatial graph includes pre-calibrated clusters for technical domains (Frontend, Backend, AI/Data, Cloud, and System Design), the node generator dynamically extracts competencies and organizational leadership areas from any uploaded resume text.'
    },
    {
      question: 'Can I edit my summary or skills before downloading the A4 PDF?',
      answer: 'Yes. The Resume Builder includes a live Quick-Edit Accordion and Mobile Edit Drawer. You can refine your executive bio, add or remove competency tags, change accent themes, and see changes reflect instantly on the A4 stage before exporting.'
    },
    {
      question: 'Can I see what questions recruiters are asking my Twin?',
      answer: 'Yes. Your candidate Command Center includes a Live Recruiter Activity Feed that logs visitor questions, AI responses, and engagement timestamps, allowing you to gauge recruiter interest trends.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const stepsToDisplay = activePerspective === 'candidates' ? candidateSteps : recruiterSteps;

  return (
    <MarketingLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24">
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#FCFAF6] dark:bg-[#1E293B] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] shadow-2xs select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SYSTEM WORKFLOW</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight leading-tight">
            From Static PDF to Interactive Digital Proxy
          </h1>

          <p className="text-base sm:text-lg text-[#5C5751] dark:text-slate-300 leading-relaxed">
            One single resume upload powers three synchronized representations: an interactive 3D competency graph, a 24/7 grounded recruiter interview agent, and an executive A4 document studio.
          </p>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-center">
            <div className="inline-flex flex-wrap sm:flex-nowrap justify-center gap-1 p-1 rounded-2xl bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] shadow-xs max-w-full">
              <button
                type="button"
                onClick={() => setActivePerspective('candidates')}
                className={`min-h-[44px] px-4 py-2.5 sm:px-5 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                  activePerspective === 'candidates'
                    ? 'bg-[#1D2B3A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs'
                    : 'text-[#5C5751] dark:text-slate-400 hover:text-[#1D2B3A] dark:hover:text-white'
                }`}
              >
                For Candidates
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('recruiters')}
                className={`min-h-[44px] px-4 py-2.5 sm:px-5 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                  activePerspective === 'recruiters'
                    ? 'bg-[#1D2B3A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs'
                    : 'text-[#5C5751] dark:text-slate-400 hover:text-[#1D2B3A] dark:hover:text-white'
                }`}
              >
                For Recruiters
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePerspective}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
            >
              {stepsToDisplay.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-7 shadow-xs dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-bold text-[#B25B3E] dark:text-[#E07A5F] tracking-wider uppercase">
                          Phase {step.num}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 flex items-center justify-center border border-[#E5E1D8]/60 dark:border-[#334155]/60">
                          <Icon className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
                        </div>
                      </div>

                      <h2 className="text-base sm:text-lg font-serif font-bold text-[#1D2B3A] dark:text-white">
                        {step.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed mt-2.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </section>

        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
              ARCHITECTURE PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white">
              End-to-End Data Synthesis Path
            </h2>
          </div>

          <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {pipelineNodes.map((node, i) => (
                <div key={i} className="flex flex-col justify-between space-y-3 relative">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#B25B3E] dark:text-[#E07A5F] uppercase tracking-wider block mb-1">
                      {node.label}
                    </span>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-[#1D2B3A] dark:text-white">
                      {node.title}
                    </h3>
                    <p className="text-xs text-[#5C5751] dark:text-slate-400 mt-1.5 leading-relaxed">
                      {node.tech}
                    </p>
                  </div>
                  {i < pipelineNodes.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#8A847C]/40 dark:text-slate-600">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white">
              Questions &amp; Answers
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-[#1D2B3A] dark:text-white leading-snug">
                      {faq.question}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#F3EFE9] dark:bg-[#0F172A] flex items-center justify-center shrink-0 border border-[#E5E1D8]/60 dark:border-[#334155]/60 text-[#1D2B3A] dark:text-slate-300">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#B25B3E]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed border-t border-[#E5E1D8]/60 dark:border-[#334155]/60 mt-1">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-[#E5E1D8]/80 dark:border-[#334155]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 shadow-2xs">
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-base text-[#1D2B3A] dark:text-white">
                Ready to see your resume as a living digital proxy?
              </h3>
              <p className="text-xs text-[#5C5751] dark:text-slate-400 mt-0.5">
                Upload your PDF document to synthesize your 3D graph and public chat link.
              </p>
            </div>
            <Link
              to="/studio"
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#B25B3E] hover:bg-[#9E4D32] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
