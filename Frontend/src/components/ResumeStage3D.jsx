import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

const ResumeStage3D = forwardRef(function ResumeStage3D(props, ref) {
  const containerRef = useRef(null);
  const tiltRef = useRef(null);
  const resumeAssemblyRef = useRef(null);
  const scannerRef = useRef(null);
  const glareRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const card4Ref = useRef(null);

  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    tilt: tiltRef.current,
    assembly: resumeAssemblyRef.current,
    scanner: scannerRef.current,
    glare: glareRef.current,
    card1: card1Ref.current,
    card2: card2Ref.current,
    card3: card3Ref.current,
    card4: card4Ref.current
  }));

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || window.innerWidth < 1024) return;

    const tiltEl = tiltRef.current;
    if (!tiltEl) return;

    const setRotateX = gsap.quickTo(tiltEl, 'rotateX', { duration: 0.6, ease: 'power2.out' });
    const setRotateY = gsap.quickTo(tiltEl, 'rotateY', { duration: 0.6, ease: 'power2.out' });

    const handlePointerMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      setRotateY(nx * 5.5);
      setRotateX(-ny * 4.5);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const skills = [
    'React 19',
    'Node.js',
    'TypeScript',
    'MySQL',
    'Three.js',
    'Gemini AI',
    'Docker',
    'System Design'
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full select-none"
      style={{ perspective: '1800px' }}
    >
      <div
        ref={tiltRef}
        className="relative will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          ref={resumeAssemblyRef}
          className="relative w-[310px] sm:w-[370px] lg:w-[410px] aspect-[1/1.38] will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateY(-16deg) rotateX(7deg) rotateZ(-1.5deg)'
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl bg-[#F9F6F0] dark:bg-[#0B1120] border border-[#E5E1D8] dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(29,43,58,0.18)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] pointer-events-none"
            style={{ transform: 'translateZ(-32px)' }}
          />

          <div
            className="absolute inset-0 rounded-2xl bg-[#FCFAF6] dark:bg-[#0F172A] border border-[#E5E1D8] dark:border-white/15 shadow-[0_25px_60px_-18px_rgba(29,43,58,0.20)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.60)] pointer-events-none"
            style={{ transform: 'translateZ(-16px)' }}
          />

          <div
            className="relative w-full h-full rounded-2xl bg-white dark:bg-[#111827]/95 border border-[#E5E1D8] dark:border-white/15 p-4 sm:p-5 lg:p-6 shadow-[0_30px_70px_-20px_rgba(29,43,58,0.22)] dark:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.65)] flex flex-col justify-between overflow-hidden"
            style={{ transform: 'translateZ(0px)', transformStyle: 'preserve-3d' }}
          >
            <div
              ref={glareRef}
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 dark:via-white/10 to-transparent opacity-60 mix-blend-overlay z-20"
            />

            <div
              ref={scannerRef}
              className="pointer-events-none absolute inset-x-0 top-0 will-change-transform opacity-0 z-30"
              style={{ transform: 'translateY(0%)' }}
            >
              <div className="h-[2px] w-full bg-[#B25B3E] dark:bg-[#E07A5F] shadow-[0_0_18px_4px_rgba(178,91,62,0.75)] dark:shadow-[0_0_20px_5px_rgba(224,122,95,0.85)]" />
              <div className="h-14 w-full bg-gradient-to-b from-[#B25B3E]/25 dark:from-[#E07A5F]/30 to-transparent" />
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex items-start justify-between border-b border-[#E5E1D8] dark:border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1D2B3A] dark:bg-[#B25B3E] text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                    MP
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#1D2B3A] dark:text-white leading-tight">
                      Manav Patel
                    </h3>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#B25B3E] dark:text-[#E07A5F]">
                      Principal Full-Stack Architect
                    </p>
                  </div>
                </div>
                <div className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>VERIFIED PDF</span>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-mono tracking-widest text-[#8A847C] dark:text-slate-400 uppercase mb-1">
                  Executive Profile
                </p>
                <p className="text-[11px] sm:text-xs text-[#5C5751] dark:text-slate-300 leading-relaxed">
                  High-scale systems architect with 8+ years designing low-latency graphics suites and AI infrastructure.{' '}
                  <span
                    data-scan-target="summary"
                    className="transition-colors duration-300 rounded px-1 py-0.5 text-[#1D2B3A] dark:text-white font-medium"
                  >
                    Scaled multi-tenant platforms to 2M+ requests/day
                  </span>{' '}
                  with zero-hallucination semantic grounding.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-mono tracking-widest text-[#8A847C] dark:text-slate-400 uppercase">
                  Select Experience
                </p>

                <div className="border-l-2 border-[#E5E1D8] dark:border-white/15 pl-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-bold text-[#1D2B3A] dark:text-white">
                      Staff Systems Architect
                    </span>
                    <span className="text-[9px] text-[#8A847C] dark:text-slate-400">2023–Present</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#5C5751] dark:text-slate-300 mt-0.5 leading-snug">
                    FinScale Cloud &middot;{' '}
                    <span
                      data-scan-target="metric-1"
                      className="transition-colors duration-300 rounded px-1 py-0.5 font-semibold text-[#1D2B3A] dark:text-white"
                    >
                      Cut p99 API latency by 64%
                    </span>{' '}
                    across 14 high-throughput clusters.
                  </p>
                </div>

                <div className="border-l-2 border-[#E5E1D8] dark:border-white/15 pl-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-bold text-[#1D2B3A] dark:text-white">
                      Senior Full-Stack Engineer
                    </span>
                    <span className="text-[9px] text-[#8A847C] dark:text-slate-400">2020–2023</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#5C5751] dark:text-slate-300 mt-0.5 leading-snug">
                    VectorOps &middot; Maintained{' '}
                    <span
                      data-scan-target="metric-2"
                      className="transition-colors duration-300 rounded px-1 py-0.5 font-semibold text-[#1D2B3A] dark:text-white"
                    >
                      99.98% SLA across 14 microservices
                    </span>{' '}
                    with zero failover data loss.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E1D8] dark:border-white/10">
              <p className="text-[9px] font-mono tracking-widest text-[#8A847C] dark:text-slate-400 uppercase mb-1.5">
                Core Competencies
              </p>
              <div
                data-scan-target="skills"
                className="flex flex-wrap gap-1 sm:gap-1.5 transition-colors duration-300 rounded-lg p-0.5"
              >
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3EFE9] dark:bg-[#1E293B] text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-white/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            ref={card1Ref}
            className="absolute -top-3 -right-5 sm:-right-8 w-44 sm:w-52 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-emerald-300 dark:border-emerald-600/50 rounded-xl shadow-xl p-2.5 sm:p-3 pointer-events-none will-change-transform z-40 opacity-0"
            style={{ transform: 'translateZ(0px) scale(0.92)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Verified Proxy
              </span>
            </div>
            <p className="font-mono text-[11px] font-bold text-[#1D2B3A] dark:text-white truncate">
              /twin/manav-patel
            </p>
            <div className="flex items-center justify-between text-[9px] text-[#5C5751] dark:text-slate-300 mt-1">
              <span>24/7 Active Agent</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute -bottom-3 left-6 w-[1.5px] h-3 bg-gradient-to-b from-emerald-500 to-transparent" />
          </div>

          <div
            ref={card2Ref}
            className="absolute top-[28%] -left-5 sm:-left-10 w-48 sm:w-56 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#B25B3E]/50 dark:border-[#E07A5F]/50 rounded-xl shadow-xl p-2.5 sm:p-3 pointer-events-none will-change-transform z-40 opacity-0"
            style={{ transform: 'translateZ(0px) scale(0.92)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-[#B25B3E] dark:text-[#E07A5F]" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B25B3E] dark:text-[#E07A5F]">
                STAR Metric Impact
              </span>
            </div>
            <p className="font-serif font-bold text-sm sm:text-base text-[#1D2B3A] dark:text-white">
              64% Latency Cut
            </p>
            <p className="text-[9px] text-[#5C5751] dark:text-slate-300 mt-0.5">
              Deterministic PDF Vector Grounding
            </p>
            <div className="absolute -bottom-3 right-6 w-[1.5px] h-3 bg-gradient-to-b from-[#B25B3E] dark:from-[#E07A5F] to-transparent" />
          </div>

          <div
            ref={card3Ref}
            className="absolute top-[52%] -right-5 sm:-right-10 w-48 sm:w-56 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#E5E1D8] dark:border-white/15 rounded-xl shadow-xl p-2.5 sm:p-3 pointer-events-none will-change-transform z-40 opacity-0"
            style={{ transform: 'translateZ(0px) scale(0.92)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B25B3E] dark:bg-[#E07A5F]" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B25B3E] dark:text-[#E07A5F]">
                3D Skill Topology
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#1D2B3A] dark:text-white">
              18 Skills &middot; 4 Clusters
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B25B3E]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="w-2 h-2 rounded-full bg-[#1D2B3A] dark:bg-white" />
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-[9px] text-[#5C5751] dark:text-slate-400 ml-1">Relational WebGL</span>
            </div>
            <div className="absolute -bottom-3 left-6 w-[1.5px] h-3 bg-gradient-to-b from-[#B25B3E] to-transparent" />
          </div>

          <div
            ref={card4Ref}
            className="absolute -bottom-4 -left-4 sm:-left-8 w-52 sm:w-60 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-emerald-300 dark:border-emerald-600/50 rounded-xl shadow-xl p-2.5 sm:p-3 pointer-events-none will-change-transform z-40 opacity-0"
            style={{ transform: 'translateZ(0px) scale(0.92)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Recruiter Query Proxy
              </span>
              <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-[10px] italic text-[#1D2B3A] dark:text-slate-200 line-clamp-2 leading-snug">
              &ldquo;Led zero-downtime distributed failover serving 220k enterprise seats...&rdquo;
            </p>
            <div className="mt-1 flex items-center justify-between text-[9px] text-[#5C5751] dark:text-slate-400">
              <span>STAR Response Engine</span>
              <span className="font-mono text-emerald-600">ZERO HALLUCINATION</span>
            </div>
            <div className="absolute -top-3 right-6 w-[1.5px] h-3 bg-gradient-to-t from-emerald-500 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ResumeStage3D;
