import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { RotateCcw } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const spriteCache = new Map();

const RECOGNIZED_SKILLS = [
  'React',
  'Node.js',
  'MySQL',
  'Express',
  'Gemini AI',
  'Sequelize',
  'JavaScript',
  'TypeScript',
  'TailwindCSS',
  'Python',
  'REST APIs',
  'GraphQL',
  'Docker',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Next.js',
  'Redux',
  'System Design',
  'Microservices',
  'AWS',
  'Git',
  'CI/CD',
  'HTML5/CSS3',
  'Three.js',
  'FastAPI'
];

const DEFAULT_SKILLS = [
  'React',
  'Node.js',
  'MySQL',
  'Express',
  'Gemini AI',
  'Sequelize',
  'REST APIs',
  'TailwindCSS'
];

function SkillGraph3D({ resumeData }) {
  const { isDarkMode } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState(() => ({
    width: 0,
    height: typeof window !== 'undefined' && window.innerWidth < 640 ? 350 : 450
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceTimer = null;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const clientWidth = containerRef.current.clientWidth;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const clientHeight = containerRef.current.clientHeight || (isMobile ? 350 : 450);
      setDimensions({
        width: clientWidth > 0 ? clientWidth : 700,
        height: clientHeight
      });
    };

    const handleResize = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(updateDimensions, 150);
    };

    updateDimensions();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const graphData = useMemo(() => {
    const candidateName = resumeData?.name || 'Candidate';
    const textToScan = `${resumeData?.bio || ''} ${resumeData?.summary || ''}`.toLowerCase();

    const extractedSkills = RECOGNIZED_SKILLS.filter((skill) => {
      const lower = skill.toLowerCase();
      return textToScan.includes(lower);
    });

    const finalSkillsList =
      extractedSkills.length >= 4
        ? Array.from(new Set([...extractedSkills, 'Gemini AI']))
        : DEFAULT_SKILLS;

    const nodes = [
      {
        id: 'Me',
        name: candidateName,
        role: 'Central Persona Core',
        color: '#B25B3E',
        val: 22
      }
    ];

    finalSkillsList.forEach((skill) => {
      nodes.push({
        id: skill,
        name: skill,
        role: 'Verified Technical Competency',
        color: isDarkMode ? '#38BDF8' : '#1D2B3A',
        val: 11
      });
    });

    const links = finalSkillsList.map((skill) => ({
      source: 'Me',
      target: skill
    }));

    const clusterPairs = [
      ['React', 'TailwindCSS'],
      ['React', 'Next.js'],
      ['Node.js', 'Express'],
      ['Express', 'REST APIs'],
      ['MySQL', 'Sequelize'],
      ['Node.js', 'MySQL'],
      ['Gemini AI', 'Node.js'],
      ['TypeScript', 'React'],
      ['Docker', 'System Design']
    ];

    clusterPairs.forEach(([s1, s2]) => {
      if (finalSkillsList.includes(s1) && finalSkillsList.includes(s2)) {
        links.push({
          source: s1,
          target: s2
        });
      }
    });

    return { nodes, links };
  }, [resumeData?.name, resumeData?.bio, resumeData?.summary, isDarkMode]);

  const handleResetCamera = () => {
    if (fgRef.current) {
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 240 }, { x: 0, y: 0, z: 0 }, 1000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#F3EFE9] dark:bg-[#0F172A] transition-colors duration-300"
    >
      <AnimatePresence>
        {dimensions.width === 0 && (
          <motion.div
            key="orbital-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#F3EFE9] dark:bg-[#0F172A] z-20 pointer-events-none transition-colors duration-300"
          >
            <div className="relative flex items-center justify-center w-16 h-16 mb-3">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#B25B3E]/30 dark:border-[#B25B3E]/40"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0.15, 0.6]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                className="w-10 h-10 rounded-full border border-[#B25B3E]/60 dark:border-[#B25B3E]/70 bg-[#B25B3E]/10 dark:bg-[#B25B3E]/20 flex items-center justify-center"
                animate={{
                  scale: [0.92, 1.06, 0.92]
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-[#B25B3E] shadow-[0_0_12px_rgba(178,91,62,0.6)]" />
              </motion.div>
            </div>
            <span className="text-xs font-serif tracking-wide text-[#5C5751] dark:text-gray-300">
              Initializing 3D spatial canvas...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {dimensions.width > 0 && (
        <motion.div
          key="spatial-canvas"
          className="w-full h-full cursor-grab active:cursor-grabbing [&_canvas]:cursor-grab [&_canvas:active]:cursor-grabbing"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.15 }
              : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor={isDarkMode ? '#0F172A' : '#F3EFE9'}
            nodeColor={(node) => (node.id === 'Me' ? '#B25B3E' : isDarkMode ? '#38BDF8' : '#1D2B3A')}
            nodeVal={(node) => node.val}
            nodeResolution={24}
            linkColor={() => (isDarkMode ? '#334155' : '#E5E1D8')}
            linkWidth={1.5}
            linkOpacity={isDarkMode ? 0.9 : 0.8}
            nodeThreeObjectExtend={true}
            nodeThreeObject={(node) => {
              const cacheKey = `${node.id}_${node.name || ''}_${isDarkMode ? 'dark' : 'light'}`;
              if (spriteCache.has(cacheKey)) {
                return spriteCache.get(cacheKey);
              }

              const sprite = new SpriteText(node.name || node.id);
              sprite.color = isDarkMode ? '#F8FAFC' : '#1D2B3A';
              sprite.backgroundColor = isDarkMode ? '#1E293B' : '#FCFAF6';
              sprite.borderColor = isDarkMode ? '#334155' : '#E5E1D8';
              sprite.borderWidth = 1;
              sprite.padding = [4, 2];
              sprite.borderRadius = 4;
              sprite.textHeight = node.id === 'Me' ? 5 : 4;
              sprite.fontFace = 'DM Sans, sans-serif';
              sprite.fontWeight = 'bold';
              sprite.position.y = node.id === 'Me' ? -15 : -10;

              spriteCache.set(cacheKey, sprite);
              return sprite;
            }}
            showNavInfo={false}
            enableNodeDrag={true}
            enableNavigationControls={true}
          />
        </motion.div>
      )}

      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2 z-10 pointer-events-auto">
        <button
          onClick={handleResetCamera}
          className="min-w-[38px] min-h-[38px] p-2 sm:px-3 sm:py-2 rounded-lg bg-[#FCFAF6] dark:bg-[#1E293B] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-white border border-[#E5E1D8] dark:border-[#334155] shadow-xs transition-colors flex items-center justify-center gap-1.5 text-xs font-sans font-medium shrink-0"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
          <span className="hidden sm:inline">Reset View</span>
        </button>
      </div>

      <div className="absolute bottom-3 left-3 sm:left-4 right-3 sm:right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none text-[10px] sm:text-[11px] font-sans">
        <div className="flex items-center gap-2.5 sm:gap-3 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/95 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#E5E1D8] dark:border-transparent shadow-2xs pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B25B3E]"></span>
            <span className="text-[#1D2B3A] dark:text-white font-semibold">{resumeData?.name || 'Me'}</span>
          </div>
          <span className="text-[#E5E1D8] dark:text-[#334155]">&bull;</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D2B3A] dark:bg-[#38BDF8]"></span>
            <span className="text-[#5C5751] dark:text-gray-300">Skills & Systems ({graphData.nodes.length - 1})</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/95 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur px-3 py-1.5 rounded-lg border border-[#E5E1D8] dark:border-transparent text-[#5C5751] dark:text-gray-400 shadow-2xs">
          <span>Rotate: Left Click + Drag</span>
          <span className="text-[#E5E1D8] dark:text-[#334155]">&bull;</span>
          <span>Zoom: Scroll</span>
          <span className="text-[#E5E1D8] dark:text-[#334155]">&bull;</span>
          <span>Pan: Right Click</span>
        </div>
      </div>
    </div>
  );
}

export default memo(SkillGraph3D);
