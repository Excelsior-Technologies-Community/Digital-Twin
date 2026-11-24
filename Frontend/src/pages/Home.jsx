import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Box,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  FileText,
  Network,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MarketingLayout from '../components/MarketingLayout';
import HeroScene3D from '../components/HeroScene3D';
import ResumeStage3D from '../components/ResumeStage3D';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const resumeCarrierRef = useRef(null);
  const resumeStageRef = useRef(null);

  const beat1Ref = useRef(null);
  const beat2Ref = useRef(null);
  const beat3Ref = useRef(null);
  const beat4Ref = useRef(null);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis = null;
    let tickerCallback = null;

    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9
      });

      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    const mm = gsap.matchMedia();

    const stage = resumeStageRef.current;
    if (!stage || !trackRef.current) return;

    const assembly = stage.assembly;
    const scanner = stage.scanner;
    const card1 = stage.card1;
    const card2 = stage.card2;
    const card3 = stage.card3;
    const card4 = stage.card4;

    const summaryTarget = stage.container?.querySelector('[data-scan-target="summary"]');
    const metric1Target = stage.container?.querySelector('[data-scan-target="metric-1"]');
    const metric2Target = stage.container?.querySelector('[data-scan-target="metric-2"]');
    const skillsTarget = stage.container?.querySelector('[data-scan-target="skills"]');

    const b1 = beat1Ref.current;
    const b2 = beat2Ref.current;
    const b3 = beat3Ref.current;
    const b4 = beat4Ref.current;
    const carrier = resumeCarrierRef.current;

    mm.add('(min-width: 1024px)', () => {
      const getOffsetX = () => Math.min((stageRef.current?.clientWidth || 1200) * 0.24, 295);

      gsap.set(carrier, { x: () => getOffsetX(), invalidateOnRefresh: true });
      gsap.set(b1, { autoAlpha: 1, x: 0, y: 0, pointerEvents: 'auto' });
      gsap.set(b2, { autoAlpha: 0, x: 44, y: 24, pointerEvents: 'none' });
      gsap.set(b3, { autoAlpha: 0, x: -44, y: 24, pointerEvents: 'none' });
      gsap.set(b4, { autoAlpha: 0, x: 44, y: 24, pointerEvents: 'none' });

      gsap.set(assembly, {
        rotateY: -16,
        rotateX: 7,
        rotateZ: -1.5,
        scale: 1,
        transformOrigin: 'center center'
      });

      gsap.set(scanner, { autoAlpha: 0, yPercent: 0 });
      gsap.set([card1, card2, card3, card4], {
        autoAlpha: 0,
        z: 0,
        scale: 0.92
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;
          }
        }
      });

      tl.to(carrier, { x: () => -getOffsetX(), ease: 'power2.inOut', duration: 0.28 }, 0.08)
        .to(assembly, { rotateY: 10, rotateX: 2, rotateZ: 0, scale: 1.04, ease: 'power2.out', duration: 0.24 }, 0.08)
        .to(b1, { y: -36, x: -28, autoAlpha: 0, pointerEvents: 'none', duration: 0.14 }, 0.08)
        .to(b2, { x: 0, y: 0, autoAlpha: 1, pointerEvents: 'auto', duration: 0.16 }, 0.16)
        .to(scanner, { autoAlpha: 1, duration: 0.04 }, 0.10)
        .to(scanner, { yPercent: 480, ease: 'none', duration: 0.22 }, 0.10);

      if (summaryTarget) {
        tl.to(summaryTarget, { backgroundColor: 'rgba(178,91,62,0.22)', duration: 0.05 }, 0.14);
      }
      if (metric1Target) {
        tl.to(metric1Target, { backgroundColor: 'rgba(178,91,62,0.22)', duration: 0.05 }, 0.18);
      }
      if (metric2Target) {
        tl.to(metric2Target, { backgroundColor: 'rgba(4,120,87,0.22)', duration: 0.05 }, 0.23);
      }
      if (skillsTarget) {
        tl.to(skillsTarget, { backgroundColor: 'rgba(178,91,62,0.12)', duration: 0.06 }, 0.26);
      }

      tl.to(scanner, { autoAlpha: 0, duration: 0.04 }, 0.28)
        .to(carrier, { x: () => getOffsetX(), ease: 'power2.inOut', duration: 0.30 }, 0.38)
        .to(b2, { y: -36, x: 28, autoAlpha: 0, pointerEvents: 'none', duration: 0.14 }, 0.38)
        .to(b3, { x: 0, y: 0, autoAlpha: 1, pointerEvents: 'auto', duration: 0.16 }, 0.46)
        .to(assembly, { rotateX: 28, rotateY: -24, rotateZ: 7, scale: 0.94, ease: 'power2.inOut', duration: 0.28 }, 0.38)
        .to(card1, { autoAlpha: 1, z: 95, scale: 1, ease: 'back.out(1.4)', duration: 0.18 }, 0.44)
        .to(card2, { autoAlpha: 1, z: 135, scale: 1, ease: 'back.out(1.4)', duration: 0.18 }, 0.48)
        .to(card3, { autoAlpha: 1, z: 115, scale: 1, ease: 'back.out(1.4)', duration: 0.18 }, 0.52)
        .to(card4, { autoAlpha: 1, z: 150, scale: 1, ease: 'back.out(1.4)', duration: 0.18 }, 0.56)
        .to(carrier, { x: () => -getOffsetX(), ease: 'power2.inOut', duration: 0.26 }, 0.72)
        .to(b3, { y: -36, x: -28, autoAlpha: 0, pointerEvents: 'none', duration: 0.14 }, 0.72)
        .to(b4, { x: 0, y: 0, autoAlpha: 1, pointerEvents: 'auto', duration: 0.16 }, 0.80)
        .to(assembly, { rotateX: 10, rotateY: 8, rotateZ: 0, scale: 0.98, ease: 'power2.out', duration: 0.24 }, 0.74)
        .to([card1, card2, card3, card4], { z: 45, autoAlpha: 0.75, scale: 0.95, duration: 0.20 }, 0.78);
    });

    mm.add('(max-width: 1023px)', () => {
      gsap.set(carrier, { x: 0 });
      gsap.set(b1, { autoAlpha: 1, y: 0, pointerEvents: 'auto' });
      gsap.set([b2, b3, b4], { autoAlpha: 0, y: 25, pointerEvents: 'none' });

      gsap.set(assembly, {
        rotateY: -16,
        rotateX: 7,
        rotateZ: -1.5,
        scale: 0.85,
        transformOrigin: 'center center'
      });

      gsap.set(scanner, { autoAlpha: 0, yPercent: 0 });
      gsap.set([card1, card2, card3, card4], {
        autoAlpha: 0,
        z: 0,
        scale: 0.92
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;
          }
        }
      });

      tl.to(b1, { autoAlpha: 0, y: -25, pointerEvents: 'none', duration: 0.12 }, 0.08)
        .to(b2, { autoAlpha: 1, y: 0, pointerEvents: 'auto', duration: 0.14 }, 0.16)
        .to(assembly, { rotateY: -4, rotateX: 2, rotateZ: 0, scale: 0.9, ease: 'power2.out', duration: 0.22 }, 0.08)
        .to(scanner, { autoAlpha: 1, duration: 0.04 }, 0.10)
        .to(scanner, { yPercent: 480, ease: 'none', duration: 0.22 }, 0.10);

      if (summaryTarget) {
        tl.to(summaryTarget, { backgroundColor: 'rgba(178,91,62,0.22)', duration: 0.05 }, 0.14);
      }
      if (metric1Target) {
        tl.to(metric1Target, { backgroundColor: 'rgba(178,91,62,0.22)', duration: 0.05 }, 0.18);
      }
      if (metric2Target) {
        tl.to(metric2Target, { backgroundColor: 'rgba(4,120,87,0.22)', duration: 0.05 }, 0.23);
      }
      if (skillsTarget) {
        tl.to(skillsTarget, { backgroundColor: 'rgba(178,91,62,0.12)', duration: 0.06 }, 0.26);
      }

      tl.to(scanner, { autoAlpha: 0, duration: 0.04 }, 0.28)
        .to(b2, { autoAlpha: 0, y: -25, pointerEvents: 'none', duration: 0.12 }, 0.38)
        .to(b3, { autoAlpha: 1, y: 0, pointerEvents: 'auto', duration: 0.14 }, 0.46)
        .to(assembly, { rotateX: 24, rotateY: -18, rotateZ: 5, scale: 0.82, ease: 'power2.inOut', duration: 0.28 }, 0.38)
        .to(card1, { autoAlpha: 1, z: 80, scale: 0.95, ease: 'back.out(1.4)', duration: 0.18 }, 0.44)
        .to(card2, { autoAlpha: 1, z: 110, scale: 0.95, ease: 'back.out(1.4)', duration: 0.18 }, 0.48)
        .to(card3, { autoAlpha: 1, z: 95, scale: 0.95, ease: 'back.out(1.4)', duration: 0.18 }, 0.52)
        .to(card4, { autoAlpha: 1, z: 120, scale: 0.95, ease: 'back.out(1.4)', duration: 0.18 }, 0.56)
        .to(b3, { autoAlpha: 0, y: -25, pointerEvents: 'none', duration: 0.12 }, 0.72)
        .to(b4, { autoAlpha: 1, y: 0, pointerEvents: 'auto', duration: 0.14 }, 0.80)
        .to(assembly, { rotateX: 8, rotateY: 0, rotateZ: 0, scale: 0.85, ease: 'power2.out', duration: 0.24 }, 0.74)
        .to([card1, card2, card3, card4], { z: 35, autoAlpha: 0.75, scale: 0.9, duration: 0.20 }, 0.78);
    });

    ScrollTrigger.refresh();

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis) lenis.destroy();
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
    };
  }, []);

  const bentoPillars = [
    {
      icon: FileText,
      eyebrow: 'INGESTION ENGINE',
      title: 'Semantic Vector Ingestion',
      description:
        'Zero-hallucination semantic extraction parsing achievements, skills, and STAR metrics directly from your PDF with 4 customizable speaking personas.'
    },
    {
      icon: Network,
      eyebrow: 'SPATIAL GRAPH',
      title: 'Interactive 3D Skill Constellation',
      description:
        'Navigate dynamic competency clusters in a 3D WebGL career galaxy featuring click-to-focus camera interpolation and contextual resume citations.'
    },
    {
      icon: Layers,
      eyebrow: 'AUTONOMOUS PROXY',
      title: '24/7 Recruiter Twin & A4 Studio',
      description:
        'Deploy your public candidate twin with conversational recruiter analytics, paired with live customizable Modern and Classic A4 document export.'
    }
  ];

  const comparisonLeftFriction = [
    'Passive two-page document that cannot answer follow-up questions',
    'Flat bullet lists that bury cross-domain engineering depth',
    'Zero visibility into what recruiters read or care about',
    'Manual layout edits every time you tailor a summary or skill list'
  ];

  const comparisonRightAdvantage = [
    '24/7 STAR-grounded AI persona answering recruiter questions on demand',
    'Interactive 3D WebGL skill constellation with domain filtering',
    'Real-time Recruiter Activity Feed tracking every inquiry',
    'Live A4 Resume Studio with 4 executive palettes and instant print export'
  ];

  return (
    <MarketingLayout>
      <HeroScene3D scrollProgressRef={scrollProgressRef} />

      <div ref={trackRef} className="relative z-10 h-[440vh]">
        <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full relative flex items-center justify-center">
            <div
              ref={resumeCarrierRef}
              className="will-change-transform z-10 flex justify-center items-center pointer-events-auto -translate-y-24 sm:-translate-y-20 lg:translate-y-0"
            >
              <ResumeStage3D ref={resumeStageRef} />
            </div>

            <div
              ref={beat1Ref}
              className="absolute z-20 w-[92%] sm:w-[84%] lg:w-[42%] max-w-lg bottom-8 sm:bottom-12 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-8 flex flex-col justify-center text-center lg:text-left pointer-events-auto"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur-md text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] shadow-2xs mb-4 sm:mb-5 w-fit mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Candidate Representation</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight leading-[1.14]">
                Your Resume, Engineered to Speak.
              </h1>

              <p className="text-sm sm:text-base text-[#5C5751] dark:text-slate-300 leading-relaxed mt-3 sm:mt-4 max-w-md mx-auto lg:mx-0">
                Transform your static PDF into an interactive 3D skill architecture and an executive digital twin that interviews recruiters 24/7.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-6 sm:mt-7 w-full sm:w-auto justify-center lg:justify-start">
                <Link
                  to="/studio"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B25B3E] hover:bg-[#9E4D32] text-white font-sans font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                >
                  <span>Launch Ingestion Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur-md hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-white font-sans font-semibold text-sm rounded-xl border border-[#E5E1D8] dark:border-[#334155] shadow-xs transition-all active:scale-[0.98]"
                >
                  <span>Explore Architecture</span>
                </Link>
              </div>

              <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start gap-2 text-xs text-[#8A847C] dark:text-slate-400 font-sans tracking-wide uppercase select-none">
                <ChevronDown className="w-3.5 h-3.5 text-[#B25B3E] animate-bounce" />
                <span>Scroll to inspect semantic extraction</span>
              </div>
            </div>

            <div
              ref={beat2Ref}
              className="absolute z-20 w-[92%] sm:w-[84%] lg:w-[42%] max-w-lg bottom-8 sm:bottom-12 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-auto lg:right-8 flex flex-col justify-center text-center lg:text-left pointer-events-none opacity-0"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans font-medium bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] mb-3 sm:mb-4 w-fit mx-auto lg:mx-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span>02 &middot; Semantic Extraction</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight leading-tight">
                Every Metric Read. Zero Hallucination.
              </h2>

              <p className="text-sm sm:text-base text-[#5C5751] dark:text-slate-300 leading-relaxed mt-3 sm:mt-4 max-w-md mx-auto lg:mx-0">
                As the Terracotta laser sweeps across your document, achievements, metrics, and technical competencies are parsed directly into high-dimensional vector embeddings.
              </p>

              <div className="mt-5 sm:mt-6 flex items-start gap-3 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border border-[#E5E1D8] dark:border-white/10 rounded-xl p-3 max-w-md mx-auto lg:mx-0 text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[#5C5751] dark:text-slate-300 leading-relaxed">
                  <strong className="text-[#1D2B3A] dark:text-white font-semibold">100% PDF Grounded:</strong> Answers cite specific lines and metrics from your original resume.
                </p>
              </div>
            </div>

            <div
              ref={beat3Ref}
              className="absolute z-20 w-[92%] sm:w-[84%] lg:w-[42%] max-w-lg bottom-8 sm:bottom-12 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-8 flex flex-col justify-center text-center lg:text-left pointer-events-none opacity-0"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans font-medium bg-[#F3EFE9] dark:bg-[#0F172A] text-[#047857] dark:text-[#10B981] border border-[#E5E1D8] dark:border-[#334155] mb-3 sm:mb-4 w-fit mx-auto lg:mx-0">
                <Box className="w-3.5 h-3.5" />
                <span>03 &middot; Layered Intelligence</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight leading-tight">
                Highlights That Lift Off the Page.
              </h2>

              <p className="text-sm sm:text-base text-[#5C5751] dark:text-slate-300 leading-relaxed mt-3 sm:mt-4 max-w-md mx-auto lg:mx-0">
                Volumetric 3D decomposition pulls key proof points forward along the Z-axis, connecting verified achievements directly to recruiter interview answers.
              </p>

              <div className="mt-5 sm:mt-6 flex items-start gap-3 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border border-[#E5E1D8] dark:border-white/10 rounded-xl p-3 max-w-md mx-auto lg:mx-0 text-left">
                <Sparkles className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F] shrink-0 mt-0.5" />
                <p className="text-xs text-[#5C5751] dark:text-slate-300 leading-relaxed">
                  <strong className="text-[#1D2B3A] dark:text-white font-semibold">Multi-Layer Depth:</strong> Proxy identities, STAR metrics, and skill matrices float in true perspective.
                </p>
              </div>
            </div>

            <div
              ref={beat4Ref}
              className="absolute z-20 w-[92%] sm:w-[84%] lg:w-[42%] max-w-lg bottom-8 sm:bottom-12 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-auto lg:right-8 flex flex-col justify-center text-center lg:text-left pointer-events-none opacity-0"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans font-medium bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] mb-3 sm:mb-4 w-fit mx-auto lg:mx-0">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>04 &middot; Ready for Recruiters</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight leading-tight">
                3D Skill Graph, Live Chat &amp; A4 Studio.
              </h2>

              <p className="text-sm sm:text-base text-[#5C5751] dark:text-slate-300 leading-relaxed mt-3 sm:mt-4 max-w-md mx-auto lg:mx-0">
                Your twin is synthesized and ready to represent your technical philosophy and leadership impact 24/7.
              </p>

              <div className="mt-6 sm:mt-7">
                <Link
                  to="/studio"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#B25B3E] hover:bg-[#9E4D32] text-white font-sans font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
                >
                  <span>Ingest Resume &amp; Synthesize Twin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 bg-[#F3EFE9] dark:bg-[#0F172A] border-t border-[#E5E1D8] dark:border-[#334155] transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-[#FCFAF6] dark:bg-[#1E293B] text-[#B25B3E] dark:text-[#E07A5F] border border-[#E5E1D8] dark:border-[#334155] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UNIFIED WORKSPACE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight">
              One Upload. Three Executive Surfaces.
            </h2>
            <p className="text-sm sm:text-base text-[#5C5751] dark:text-slate-300 leading-relaxed mt-3.5">
              A single verified PDF document powers interactive 3D exploration, 24/7 AI recruiter interviews, and customizable print-ready executive resumes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 sm:mt-16">
            {bentoPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#FCFAF6] dark:bg-[#1E293B] border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#F3EFE9] dark:bg-[#0F172A] text-[#B25B3E] dark:text-[#E07A5F] flex items-center justify-center border border-[#E5E1D8]/60 dark:border-[#334155]/60 mb-5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8A847C] dark:text-slate-400 uppercase block mb-1.5">
                      {pillar.eyebrow}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#1D2B3A] dark:text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-relaxed mt-2.5">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-24 sm:mt-32">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-[#FCFAF6] dark:bg-[#1E293B] text-[#047857] dark:text-[#10B981] border border-[#E5E1D8] dark:border-[#334155] mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>THE PARADIGM SHIFT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2B3A] dark:text-white tracking-tight">
                Why Static Resumes Fall Short
              </h2>
              <p className="text-sm sm:text-base text-[#5C5751] dark:text-slate-300 leading-relaxed mt-3.5">
                Modern engineering impact is too complex for two flat pages. See how a conversational 3D proxy replaces static document friction.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 sm:mt-16 items-stretch">
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#FCFAF6]/70 dark:bg-[#1E293B]/50 border border-[#E5E1D8] dark:border-[#334155] rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8] dark:border-[#334155]">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#1D2B3A] dark:text-white">
                        Static PDF Resume
                      </h3>
                      <p className="text-xs text-[#5C5751] dark:text-slate-400 mt-0.5">
                        Traditional flat paper artifact
                      </p>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#F3EFE9] dark:bg-[#0F172A] text-[#8A847C] dark:text-slate-400 border border-[#E5E1D8] dark:border-[#334155]">
                      PASSIVE
                    </span>
                  </div>

                  <ul className="mt-6 space-y-4">
                    {comparisonLeftFriction.map((text, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="text-xs sm:text-sm text-[#5C5751] dark:text-slate-300 leading-snug">
                          {text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#FCFAF6] dark:bg-[#1E293B] border-2 border-[#B25B3E]/40 dark:border-[#E07A5F]/40 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8] dark:border-[#334155]">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#1D2B3A] dark:text-white">
                        Digital Twin Proxy
                      </h3>
                      <p className="text-xs text-[#5C5751] dark:text-slate-400 mt-0.5">
                        Autonomous interactive representation
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      RECOMMENDED
                    </span>
                  </div>

                  <ul className="mt-6 space-y-4">
                    {comparisonRightAdvantage.map((text, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm text-[#1D2B3A] dark:text-slate-200 leading-snug font-medium">
                          {text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 sm:mt-28 mb-4 rounded-3xl bg-[#1D2B3A] dark:bg-[#1E293B] text-white border border-[#1D2B3A] dark:border-[#334155] p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl"
          >
            <div className="max-w-xl">
              <span className="text-xs font-mono font-bold tracking-widest text-[#E07A5F] uppercase mb-2.5 block">
                READY TO DEPLOY
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight leading-tight">
                Turn Your Next Application Into a Conversation.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3">
                Upload your resume to synthesize your interactive 3D skill architecture and public interview twin in under 60 seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto shrink-0">
              <Link
                to="/studio"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B25B3E] hover:bg-[#9E4D32] text-white font-sans font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E]"
              >
                <span>Open Ingestion Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center px-4 py-3.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                <span>Explore How It Works</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </MarketingLayout>
  );
}
