import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Box,
  Palette,
  Code,
  Cpu,
  Database,
  FileText,
  Network,
  Mail,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import MarketingLayout from '../components/MarketingLayout';

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const CREATOR_LINKS = {
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  email: 'mailto:hello@digitaltwin.studio'
};

export default function About() {
  const [activeStage, setActiveStage] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const principles = [
    {
      icon: ShieldCheck,
      title: 'Grounded Truth Over Hype',
      summary:
        'Conversational responses are strictly bound to uploaded resume facts through deterministic STAR-method framing. If an achievement or capability is not present in the candidate dossier, the digital twin candidly clarifies boundaries rather than hallucinating.'
    },
    {
      icon: Box,
      title: 'Spatial Clarity Over Bullet Fatigue',
      summary:
        'Flat resume bullet points fail to convey engineering interconnectivity. Transforming skills into an interactive 3D WebGL graph allows hiring managers to immediately understand domain relationships across Frontend, Backend, AI/Data, Cloud, and System Design.'
    },
    {
      icon: Palette,
      title: 'Editorial Craft Over Generic Templates',
      summary:
        'Designed with warm archival paper tones, Playfair Display typography, deliberate dark and light surface elevations, and responsive A4 print tooling that respects millimeter dimensions and real-world executive review standards.'
    }
  ];

  const pipelineStages = [
    {
      id: '01',
      title: 'PDF Buffer Extraction',
      badge: 'STAGE 01 · IN-MEMORY PARSING',
      icon: FileText,
      description:
        'Multer handles multipart PDF uploads with a strict 10MB file limit directly in Node.js memory buffers. pdf-parse extracts clean raw text streams without temporary disk clutter or external file storage leaks.',
      stack: ['Multer v1.4', 'pdf-parse', 'MemoryBuffer'],
      logHeader: 'INGESTION ENGINE // RAW TEXT BUFFER',
      logLines: [
        '[BUFFER: INGESTION]',
        'Size: 1.42 MB | MimeType: application/pdf',
        'Parser: pdf-parse v1.1.1 (In-Memory Stream)',
        'Status: 200 OK | Extracted: 4,820 Characters',
        'Sanitization: Stripped unprintable control chars',
        'Integrity: SHA-256 buffer hash verified'
      ]
    },
    {
      id: '02',
      title: 'Semantic Synthesis',
      badge: 'STAGE 02 · SCHEMA GENERATION',
      icon: Cpu,
      description:
        'Google Gemini parses unstructured resume text into a deterministic candidate schema: bio summary, skills matrix, experience STAR points, and education. Generates a collision-resistant public slug.',
      stack: ['Gemini 2.5 Flash', 'Structured JSON', 'Slug Generator'],
      logHeader: 'SYNTHESIS CORE // JSON NORMALIZATION',
      logLines: [
        '[SYNTHESIS: SCHEMA EXTRACTION]',
        'Model: gemini-2.5-flash | Temp: 0.2 (Low Variance)',
        'Payload: { candidateName, skills: 18, roles: 3 }',
        'Slug: "manav-patel" | UniqueHash: 0x9f4a',
        'Format: Strict JSON validation passed',
        'Store: Sequelize models populated'
      ]
    },
    {
      id: '03',
      title: 'Grounding Boundary',
      badge: 'STAGE 03 · ZERO-HALLUCINATION GUARD',
      icon: ShieldCheck,
      description:
        'Every conversational query is bounded by the candidate’s exact rawResumeText. Gemini is instructed to decline fabricating unverified skills or unlisted metrics, maintaining strict factual truth.',
      stack: ['System Prompts', 'rawResumeText', 'STAR Bounds'],
      logHeader: 'GUARDRAIL // FACTUAL VERIFICATION TRACE',
      logLines: [
        '[GUARDRAIL: TRUTH BOUNDARY CHECK]',
        'Prompt: "Tell me about your Kubernetes experience."',
        'Search rawResumeText: [Not Found]',
        'Boundary Guardrail: Triggered',
        'Output: "Candidate has not listed Kubernetes;',
        'primary orchestration is Docker & microservices."'
      ]
    },
    {
      id: '04',
      title: 'STAR Delivery & Spatial Map',
      badge: 'STAGE 04 · MULTI-SURFACE DISPATCH',
      icon: Network,
      description:
        'Recruiter chats are served in structured Situation-Task-Action-Result format at /twin/:slug. Simultaneously, extracted competencies project onto the 3D WebGL graph and sync to the A4 Resume Studio.',
      stack: ['Three.js WebGL', 'STAR Formatter', 'A4 PDF Studio'],
      logHeader: 'DISCOVERY // REAL-TIME DISPATCH',
      logLines: [
        '[DISCOVERY: MULTI-SURFACE DISPATCH]',
        'Surface A: /twin/manav-patel (STAR Recruiter Chat)',
        'Surface B: SkillGraph3D (18 Nodes · 4 Clusters)',
        'Surface C: A4 Resume Studio (Vector Print Engine)',
        'Analytics: Logged query to recruiter activity feed',
        'Latency: 284ms end-to-end'
      ]
    }
  ];

  const techStack = [
    {
      icon: Code,
      category: 'Frontend & Motion',
      title: 'React 19 & Framer Motion',
      description:
        'Component architecture built on React 19, Vite, and Tailwind CSS. Smooth spring physics, layout animations, and accessible reduced-motion support.'
    },
    {
      icon: Box,
      category: '3D Spatial Engine',
      title: 'Three.js & WebGL Graph',
      description:
        'Spatial competency clustering using force-directed graph physics, in-memory sprite caching, smooth camera focus interpolation, and touch scroll guards.'
    },
    {
      icon: Cpu,
      category: 'AI Synthesis Core',
      title: 'Google Gemini Generative AI',
      description:
        'Structured JSON ATS extraction from PDF text buffers and tone-adaptive STAR interviewing with multi-turn conversation memory.'
    },
    {
      icon: Database,
      category: 'Backend & Persistence',
      title: 'Express 5 & MySQL Store',
      description:
        'REST API routing, in-memory Multer PDF parsing, Sequelize ORM models, collision-free slug generation, and recruiter Q&A interaction logging.'
    }
  ];

  const currentStage = pipelineStages[activeStage];

  return (
    <MarketingLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24">
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#FCFAF6] dark:bg-[#1E293B] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] shadow-2xs select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ABOUT DIGITAL TWIN</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight leading-tight">
            Resumes Shouldn’t Be Silent Documents
          </h1>

          <p className="text-base sm:text-lg text-[#5C5751] dark:text-slate-300 leading-relaxed">
            Traditional two-page PDFs flatten years of complex problem-solving into passive bullet points. Digital Twin transforms career history into an interactive spatial architecture and an always-available conversational representative.
          </p>
        </section>

        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
              CORE PHILOSOPHY
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white">
              Principles Guiding Our Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-7 shadow-xs dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] flex items-center justify-center mb-4 border border-[#E5E1D8]/60 dark:border-[#334155]/60">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#1D2B3A] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed mt-3">
                      {item.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
              GROUNDING ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white">
              How Every Answer Stays 100% Verifiable
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed">
              Explore the deterministic pipeline that extracts, normalizes, and bounds candidate intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStage === idx;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  aria-pressed={isActive}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] cursor-pointer ${
                    isActive
                      ? 'bg-[#FCFAF6] dark:bg-[#1E293B] border-[#B25B3E] dark:border-[#E07A5F] shadow-sm'
                      : 'bg-[#FCFAF6]/60 dark:bg-[#1E293B]/60 border-[#E5E1D8] dark:border-[#334155] hover:border-[#B25B3E]/40 dark:hover:border-[#E07A5F]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isActive
                          ? 'text-[#B25B3E] dark:text-[#E07A5F]'
                          : 'text-[#8A847C] dark:text-slate-400'
                      }`}
                    >
                      {stage.id}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-[#B25B3E] dark:text-[#E07A5F]'
                          : 'text-[#8A847C] dark:text-slate-400'
                      }`}
                    />
                  </div>
                  <p className="font-serif font-bold text-sm text-[#1D2B3A] dark:text-white truncate">
                    {stage.title}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-8 shadow-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
              >
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155]">
                    <span>{currentStage.badge}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2B3A] dark:text-white">
                    {currentStage.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed">
                    {currentStage.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] font-mono font-bold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block mb-2">
                      Verified Architecture
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentStage.stack.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-[#334155]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-xl bg-[#1D2B3A] dark:bg-[#0B1120] text-slate-100 p-4 sm:p-5 font-mono text-xs shadow-inner border border-[#2A3F55] dark:border-white/10">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Terminal className="w-3 h-3 text-[#E07A5F]" />
                        <span>{currentStage.logHeader}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] leading-relaxed">
                      {currentStage.logLines.map((line, i) => (
                        <p
                          key={i}
                          className={
                            line.includes('Status:') || line.includes('passed') || line.includes('Active')
                              ? 'text-emerald-400 font-semibold'
                              : line.includes('Prompt:') || line.includes('Output:')
                                ? 'text-[#E07A5F]'
                                : 'text-slate-300'
                          }
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
              ENGINEERING BENTO
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white">
              Technologies Powering the Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {techStack.map((tech, i) => {
              const Icon = tech.icon;
              return (
                <div
                  key={i}
                  className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-7 shadow-xs dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 flex items-center justify-center shrink-0 border border-[#E5E1D8]/60 dark:border-[#334155]/60">
                    <Icon className="w-5 h-5 text-[#B25B3E] dark:text-[#E07A5F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-[#8A847C] dark:text-slate-400 uppercase tracking-wider block mb-1">
                      {tech.category}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#1D2B3A] dark:text-white">
                      {tech.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed mt-2">
                      {tech.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-sans font-semibold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
              CREATOR SPOTLIGHT
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2B3A] dark:text-white">
              Architect Behind Digital Twin
            </h2>
          </div>

          <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 flex flex-col items-start border-b lg:border-b-0 lg:border-r border-[#E5E1D8] dark:border-[#334155] pb-8 lg:pb-0 lg:pr-8">
                <div className="w-14 h-14 rounded-2xl bg-[#1D2B3A] dark:bg-[#B25B3E] text-[#FCFAF6] flex items-center justify-center font-serif font-bold text-xl shadow-xs ring-4 ring-[#E5E1D8]/60 dark:ring-[#334155]/60 mb-4 select-none">
                  MP
                </div>

                <h3 className="font-serif font-bold text-2xl text-[#1D2B3A] dark:text-white tracking-tight">
                  Manav Patel
                </h3>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#B25B3E] dark:text-[#E07A5F] mt-1">
                  Full-Stack Developer &amp; Creator
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mt-3.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                  <span>Open to Engineering Roles</span>
                </div>

                <div className="flex items-center gap-2.5 mt-5">
                  <a
                    href={CREATOR_LINKS.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Manav Patel GitHub"
                    className="w-10 h-10 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={CREATOR_LINKS.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Manav Patel LinkedIn"
                    className="w-10 h-10 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={CREATOR_LINKS.email}
                    aria-label="Contact Manav Patel"
                    className="w-10 h-10 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 hover:text-[#B25B3E] dark:hover:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <span className="text-[10px] font-mono font-bold text-[#8A847C] dark:text-slate-400 uppercase tracking-widest block">
                  CREATOR NOTE
                </span>

                <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed">
                  I built Digital Twin to solve the core limitation of modern technical hiring: static PDF resumes fail to convey how engineers think, build, and solve problems under pressure. By synthesizing raw resume facts into an interactive 3D spatial graph, an always-on conversational proxy, and a millimeter-perfect executive document studio, candidates can finally be evaluated with depth, precision, and zero friction.
                </p>

                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-[#334155]">
                      Full-Stack Systems
                    </span>
                    <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-[#334155]">
                      3D WebGL &amp; Motion
                    </span>
                    <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-[#334155]">
                      Applied AI Grounding
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#B25B3E] dark:text-[#E07A5F] uppercase tracking-wider block">
                CONTINUE READING
              </span>
              <h3 className="text-lg font-serif font-bold text-[#1D2B3A] dark:text-white">
                Understand the 3-Step Ingestion &amp; Chat Lifecycle
              </h3>
              <p className="text-xs text-[#5C5751] dark:text-slate-400 leading-relaxed">
                See how candidate PDFs transition into live WebGL competency graphs and recruiter intelligence.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D2B3A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#2A3F55] dark:hover:bg-slate-100 text-xs font-semibold rounded-xl transition-all active:scale-[0.98] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
            >
              <span>Explore the Workflow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
