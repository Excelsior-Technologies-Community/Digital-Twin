import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import gsap from 'gsap';

const TONE_POSTURES = {
  Professional: 'Structured STAR narratives with formal architectural precision.',
  'Direct & Technical': 'Code-level systems thinking, benchmarks, and concrete tradeoffs.',
  'Confident & Executive': 'Strategic leadership outcomes, velocity, and business impact.',
  'Friendly & Conversational': 'Approachable, collaborative walkthroughs of team contributions.'
};

const getInitials = (rawName) => {
  const trimmed = (rawName || '').trim();
  if (!trimmed) return 'DT';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatChipSize = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes >= 1048576) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const getSlugPreview = (rawName) => {
  const trimmed = (rawName || '').trim().toLowerCase();
  const slug = trimmed.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `/twin/${slug || 'your-name'}-xxxx`;
};

export default function StudioPersonaCard3D({ name = '', tone = 'Professional', file = null, isSubmitting = false }) {
  const tiltRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || window.innerWidth < 1024) return;

    const tiltEl = tiltRef.current;
    if (!tiltEl) return;

    const setRotateX = gsap.quickTo(tiltEl, 'rotateX', { duration: 0.55, ease: 'power2.out' });
    const setRotateY = gsap.quickTo(tiltEl, 'rotateY', { duration: 0.55, ease: 'power2.out' });

    const handlePointerMove = (e) => {
      if (window.innerWidth < 1024) return;
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      setRotateY(nx * 6);
      setRotateX(-ny * 5);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const trimmedName = (name || '').trim();
  const initials = getInitials(trimmedName);
  const slugPreview = getSlugPreview(trimmedName);
  const toneTagline = TONE_POSTURES[tone] || TONE_POSTURES.Professional;

  const isIdentityReady = trimmedName.length > 0;
  const isPdfReady = Boolean(file);

  const chipConfig = [
    {
      key: 'pdf',
      label: 'PDF',
      ready: isPdfReady,
      text: isPdfReady ? `ATTACHED · ${formatChipSize(file.size)}` : 'AWAITING PDF'
    },
    {
      key: 'identity',
      label: 'IDENTITY',
      ready: isIdentityReady,
      text: isIdentityReady ? 'READY' : 'ENTER NAME'
    }
  ];

  return (
    <div className="relative w-full select-none mb-5" style={{ perspective: '1400px' }}>
      <div
        ref={tiltRef}
        className="relative will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 rounded-2xl bg-[#EAE4DA] dark:bg-[#0B1120] border border-[#E5E1D8] dark:border-[#334155]/80 shadow-md pointer-events-none"
          style={{ transform: 'translateZ(-14px) translateY(6px)' }}
          aria-hidden="true"
        />

        <div
          className="relative rounded-2xl bg-[#FFFFFF] dark:bg-[#162032] border border-[#E5E1D8] dark:border-[#334155] shadow-[0_18px_38px_-14px_rgba(29,43,58,0.16)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_22px_45px_-14px_rgba(0,0,0,0.55)] p-4 sm:p-5 overflow-hidden"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0px)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/25 dark:via-white/5 to-transparent opacity-70 z-10"
            aria-hidden="true"
          />

          <AnimatePresence>
            {isSubmitting && !shouldReduceMotion && (
              <motion.div
                key="persona-laser-scan"
                initial={{ y: '0%', opacity: 0 }}
                animate={{ y: ['0%', '88%', '0%'], opacity: [0.95, 0.95, 0.95] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-0 z-30 will-change-transform"
                aria-hidden="true"
              >
                <div className="h-[2px] w-full bg-[#B25B3E] dark:bg-[#E07A5F] shadow-[0_0_14px_3px_rgba(178,91,62,0.75)] dark:shadow-[0_0_16px_4px_rgba(224,122,95,0.85)]" />
                <div className="h-8 w-full bg-gradient-to-b from-[#B25B3E]/20 dark:from-[#E07A5F]/20 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-20 space-y-3.5" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0" style={{ transformStyle: 'preserve-3d' }}>
                <div
                  className="w-10 h-10 rounded-xl bg-[#1D2B3A] dark:bg-[#B25B3E] text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm shrink-0"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <p
                    className={`font-serif font-bold text-base leading-tight truncate ${
                      isIdentityReady
                        ? 'text-[#1D2B3A] dark:text-white'
                        : 'text-[#8A847C] dark:text-slate-400'
                    }`}
                  >
                    {isIdentityReady ? trimmedName : 'Candidate Name'}
                  </p>
                  <p className="font-mono text-[11px] text-[#B25B3E] dark:text-[#E07A5F] truncate mt-0.5">
                    {slugPreview}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest bg-[#F3EFE9] dark:bg-[#0F172A] text-[#5C5751] dark:text-slate-300 border border-[#E5E1D8] dark:border-[#334155] shrink-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSubmitting
                      ? 'bg-[#B25B3E] dark:bg-[#E07A5F] animate-pulse'
                      : isPdfReady && isIdentityReady
                        ? 'bg-[#047857] dark:bg-[#10B981]'
                        : 'bg-[#8A847C] dark:bg-slate-500'
                  }`}
                />
                <span>{isSubmitting ? 'SYNCING' : '3D PROXY'}</span>
              </span>
            </div>

            <div className="rounded-xl bg-[#F3EFE9]/75 dark:bg-[#0F172A]/75 border border-[#E5E1D8] dark:border-[#334155]/80 p-2.5 sm:p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-[#8A847C] dark:text-slate-400">
                  <Sparkles className="w-2.5 h-2.5 text-[#B25B3E] dark:text-[#E07A5F]" />
                  <span>Voice Calibration</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#1D2B3A] dark:text-slate-200 px-2 py-0.5 rounded-md bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155]">
                  {tone}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={tone}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="text-[11px] text-[#5C5751] dark:text-slate-300 leading-snug"
                >
                  {toneTagline}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {chipConfig.map((chip) => (
                <div
                  key={chip.key}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                    chip.ready
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 text-[#047857] dark:text-[#10B981] border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-[#F3EFE9]/80 dark:bg-[#0F172A]/70 text-[#8A847C] dark:text-slate-400 border-[#E5E1D8] dark:border-[#334155]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      chip.ready
                        ? 'bg-[#047857] dark:bg-[#10B981]'
                        : 'bg-[#8A847C]/60 dark:bg-slate-500'
                    }`}
                  />
                  <span className="font-bold">{chip.label}</span>
                  <span className="opacity-50">&middot;</span>
                  <span className="truncate max-w-[160px]">{chip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
