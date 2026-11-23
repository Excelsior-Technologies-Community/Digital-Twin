import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { RotateCcw, X, Move3d, Lock } from 'lucide-react';
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

const categorizeSkill = (skillName) => {
  const s = skillName.toLowerCase();
  if (
    s.includes('react') ||
    s.includes('html') ||
    s.includes('css') ||
    s.includes('tailwind') ||
    s.includes('three') ||
    s.includes('redux') ||
    s.includes('next') ||
    s.includes('front')
  ) {
    return 'Frontend';
  }
  if (
    s.includes('node') ||
    s.includes('express') ||
    s.includes('api') ||
    s.includes('fastapi') ||
    s.includes('graphql') ||
    s.includes('sql') ||
    s.includes('mongo') ||
    s.includes('redis') ||
    s.includes('sequelize') ||
    s.includes('postgre')
  ) {
    return 'Backend & APIs';
  }
  if (
    s.includes('docker') ||
    s.includes('aws') ||
    s.includes('ci/cd') ||
    s.includes('git') ||
    s.includes('cloud') ||
    s.includes('devops')
  ) {
    return 'Cloud & DevOps';
  }
  if (
    s.includes('ai') ||
    s.includes('gemini') ||
    s.includes('python') ||
    s.includes('data') ||
    s.includes('ml')
  ) {
    return 'AI & Data';
  }
  if (
    s.includes('security') ||
    s.includes('auth') ||
    s.includes('oauth') ||
    s.includes('encrypt')
  ) {
    return 'Security';
  }
  if (
    s.includes('system') ||
    s.includes('microservice') ||
    s.includes('architect')
  ) {
    return 'System Design';
  }
  return 'Core Skills';
};

function SkillGraph3D({ resumeData }) {
  const { isDarkMode } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const fgRef = useRef();

  const [dimensions, setDimensions] = useState(() => ({
    width: 0,
    height: typeof window !== 'undefined' && window.innerWidth < 640 ? 350 : 450
  }));

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isTouchInteractive, setIsTouchInteractive] = useState(false);

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

  useEffect(() => {
    if (!selectedNode) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedNode]);

  const candidateDisplayName = resumeData?.name?.trim() || 'Candidate';

  const graphData = useMemo(() => {
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
        id: 'center-core',
        name: candidateDisplayName,
        role: 'Central Persona Core',
        category: 'Core Profile',
        color: '#B25B3E',
        val: 22,
        isCenter: true
      }
    ];

    finalSkillsList.forEach((skill) => {
      nodes.push({
        id: skill,
        name: skill,
        role: 'Verified Technical Competency',
        category: categorizeSkill(skill),
        color: isDarkMode ? '#38BDF8' : '#1D2B3A',
        val: 11,
        isCenter: false
      });
    });

    const links = finalSkillsList.map((skill) => ({
      source: 'center-core',
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
  }, [candidateDisplayName, resumeData?.bio, resumeData?.summary, isDarkMode]);

  const categories = useMemo(() => {
    const cats = new Set();
    graphData.nodes.forEach((n) => {
      if (!n.isCenter && n.category) {
        cats.add(n.category);
      }
    });
    return ['All', ...Array.from(cats)];
  }, [graphData]);

  const focusNode = (node) => {
    if (!node || !fgRef.current || typeof fgRef.current.cameraPosition !== 'function') return;
    const distance = 95;
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
    fgRef.current.cameraPosition(
      {
        x: (node.x || 0) * distRatio,
        y: (node.y || 0) * distRatio,
        z: (node.z || 0) * distRatio
      },
      { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
      800
    );
  };

  const handleNodeClick = (node) => {
    if (!node) return;
    setSelectedNode(node);
    focusNode(node);
  };

  const handleResetCamera = () => {
    setSelectedNode(null);
    setActiveCategory('All');
    if (fgRef.current && typeof fgRef.current.cameraPosition === 'function') {
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 240 }, { x: 0, y: 0, z: 0 }, 1000);
    }
  };

  const getResumeSnippet = (node) => {
    if (node.isCenter) {
      return (
        resumeData?.bio ||
        resumeData?.summary ||
        'Executive AI Digital Twin representative grounded in verified candidate career data.'
      );
    }

    const fullText = `${resumeData?.bio || ''} ${resumeData?.summary || ''}`;
    if (!fullText.trim()) {
      return 'Verified competency extracted from candidate resume profile.';
    }

    const sentences = fullText.split(/(?<=[.?!])\s+/);
    const skillLower = node.name.toLowerCase();
    const matchingSentence = sentences.find((s) => s.toLowerCase().includes(skillLower));

    if (matchingSentence && matchingSentence.trim()) {
      return matchingSentence.trim();
    }

    return 'Verified competency extracted from candidate resume profile.';
  };

  const siblingSkills = useMemo(() => {
    if (!selectedNode || selectedNode.isCenter) return [];
    return graphData.nodes
      .filter((n) => !n.isCenter && n.category === selectedNode.category && n.id !== selectedNode.id)
      .slice(0, 4);
  }, [selectedNode, graphData]);

  const handleSiblingClick = (sibling) => {
    setSelectedNode(sibling);
    focusNode(sibling);
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
            nodeColor={(node) => {
              if (node.isCenter) return '#B25B3E';
              const isMatch = activeCategory === 'All' || node.category === activeCategory;
              if (isMatch) {
                if (selectedNode && selectedNode.id === node.id) {
                  return '#B25B3E';
                }
                return isDarkMode ? '#38BDF8' : '#1D2B3A';
              }
              return isDarkMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(29, 43, 58, 0.15)';
            }}
            nodeVal={(node) => node.val}
            nodeResolution={24}
            linkColor={(link) => {
              if (activeCategory === 'All') {
                return isDarkMode ? '#334155' : '#E5E1D8';
              }
              const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find((n) => n.id === link.source);
              const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find((n) => n.id === link.target);
              const isMatch =
                sourceNode &&
                (sourceNode.isCenter || sourceNode.category === activeCategory) &&
                targetNode &&
                (targetNode.isCenter || targetNode.category === activeCategory);
              return isMatch
                ? isDarkMode ? '#38BDF8' : '#B25B3E'
                : isDarkMode ? 'rgba(51, 65, 85, 0.15)' : 'rgba(229, 225, 216, 0.2)';
            }}
            linkWidth={(link) => {
              if (activeCategory === 'All') return 1.5;
              const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find((n) => n.id === link.source);
              const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find((n) => n.id === link.target);
              const isMatch =
                sourceNode &&
                (sourceNode.isCenter || sourceNode.category === activeCategory) &&
                targetNode &&
                (targetNode.isCenter || targetNode.category === activeCategory);
              return isMatch ? 2 : 0.8;
            }}
            linkOpacity={(link) => {
              if (activeCategory === 'All') return isDarkMode ? 0.9 : 0.8;
              const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find((n) => n.id === link.source);
              const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find((n) => n.id === link.target);
              const isMatch =
                sourceNode &&
                (sourceNode.isCenter || sourceNode.category === activeCategory) &&
                targetNode &&
                (targetNode.isCenter || targetNode.category === activeCategory);
              return isMatch ? 0.9 : 0.15;
            }}
            nodeThreeObjectExtend={true}
            nodeThreeObject={(node) => {
              const isMatch = activeCategory === 'All' || node.isCenter || node.category === activeCategory;
              const isSelected = selectedNode && selectedNode.id === node.id;
              const cacheKey = `${node.id}_${node.name || ''}_${isDarkMode ? 'dark' : 'light'}_${isMatch ? 'match' : 'dim'}_${isSelected ? 'sel' : 'norm'}`;
              if (spriteCache.has(cacheKey)) {
                return spriteCache.get(cacheKey);
              }

              const labelText = node.isCenter ? (node.name || 'Candidate') : (node.name || node.id);
              const sprite = new SpriteText(labelText);

              if (isSelected) {
                sprite.color = '#FFFFFF';
                sprite.backgroundColor = '#B25B3E';
                sprite.borderColor = '#B25B3E';
              } else if (isMatch) {
                sprite.color = isDarkMode ? '#F8FAFC' : '#1D2B3A';
                sprite.backgroundColor = isDarkMode ? '#1E293B' : '#FCFAF6';
                sprite.borderColor = isDarkMode ? '#334155' : '#E5E1D8';
              } else {
                sprite.color = isDarkMode ? 'rgba(248, 250, 252, 0.2)' : 'rgba(29, 43, 58, 0.2)';
                sprite.backgroundColor = isDarkMode ? 'rgba(30, 41, 59, 0.2)' : 'rgba(252, 250, 246, 0.2)';
                sprite.borderColor = isDarkMode ? 'rgba(51, 65, 85, 0.2)' : 'rgba(229, 225, 216, 0.2)';
              }

              sprite.borderWidth = 1;
              sprite.padding = [4, 2];
              sprite.borderRadius = 4;
              sprite.textHeight = node.isCenter ? 5.5 : 4;
              sprite.fontFace = 'DM Sans, sans-serif';
              sprite.fontWeight = 'bold';
              sprite.position.y = node.isCenter ? -16 : -11;

              spriteCache.set(cacheKey, sprite);
              return sprite;
            }}
            showNavInfo={false}
            enableNodeDrag={true}
            enableNavigationControls={true}
            onNodeClick={handleNodeClick}
            onBackgroundClick={() => setSelectedNode(null)}
          />
        </motion.div>
      )}

      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex items-center gap-1.5 flex-wrap max-w-[calc(100%-140px)] sm:max-w-md pointer-events-auto">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setSelectedNode(null);
              }}
              aria-pressed={isActive}
              className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-sans font-medium transition-all duration-150 border select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E] ${
                isActive
                  ? 'bg-[#B25B3E] text-white border-[#B25B3E] shadow-sm'
                  : 'bg-[#FCFAF6]/90 dark:bg-[#0F172A]/85 text-[#5C5751] dark:text-slate-300 hover:text-[#1D2B3A] dark:hover:text-white border-[#E5E1D8] dark:border-[#334155] backdrop-blur-sm'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2 z-10 pointer-events-auto">
        {isTouchInteractive && (
          <button
            type="button"
            onClick={() => setIsTouchInteractive(false)}
            aria-label="Lock 3D canvas and restore page scrolling"
            className="lg:hidden min-h-[38px] px-3 py-2 rounded-lg bg-[#FCFAF6] dark:bg-[#1E293B] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-white border border-[#E5E1D8] dark:border-[#334155] shadow-xs transition-colors flex items-center gap-1.5 text-xs font-sans font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
          >
            <Lock className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
            <span>Lock Scroll</span>
          </button>
        )}
        <button
          onClick={handleResetCamera}
          className="min-w-[38px] min-h-[38px] p-2 sm:px-3 sm:py-2 rounded-lg bg-[#FCFAF6] dark:bg-[#1E293B] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-[#E5E1D8] dark:hover:bg-[#334155] text-[#1D2B3A] dark:text-white border border-[#E5E1D8] dark:border-[#334155] shadow-xs transition-colors flex items-center justify-center gap-1.5 text-xs font-sans font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#B25B3E] dark:text-[#E07A5F]" />
          <span className="hidden sm:inline">Reset View</span>
        </button>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-14 right-3 sm:right-4 bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#E5E1D8] dark:border-[#334155] rounded-xl p-4 shadow-xl dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] w-72 max-w-[calc(100%-2rem)] z-20 pointer-events-auto"
          >
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="min-w-0">
                <span className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[#B25B3E] dark:text-[#E07A5F] block truncate">
                  {selectedNode.category || (selectedNode.isCenter ? 'Core Profile' : 'Technical Skill')}
                </span>
                <h4 className="font-serif font-bold text-base text-[#1D2B3A] dark:text-white truncate">
                  {selectedNode.name || selectedNode.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                aria-label="Close skill inspector"
                className="p-1 rounded-md text-[#5C5751] hover:text-[#1D2B3A] dark:text-gray-400 dark:hover:text-white hover:bg-[#E5E1D8]/60 dark:hover:bg-[#334155] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B25B3E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3">
              <span className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-1">
                {selectedNode.isCenter ? 'Candidate Profile' : 'Resume Context'}
              </span>
              <div className="bg-[#F3EFE9]/80 dark:bg-[#0F172A]/75 rounded-lg p-2.5 text-xs text-[#1D2B3A] dark:text-slate-200 leading-relaxed max-h-28 overflow-y-auto">
                {getResumeSnippet(selectedNode)}
              </div>
            </div>

            {siblingSkills.length > 0 && (
              <div>
                <span className="font-sans font-semibold text-[10px] uppercase tracking-widest text-[#5C5751] dark:text-slate-400 block mb-1.5">
                  Related Skills in Domain
                </span>
                <div className="flex flex-wrap gap-1">
                  {siblingSkills.map((sibling) => (
                    <button
                      key={sibling.id}
                      type="button"
                      onClick={() => handleSiblingClick(sibling)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-[#F3EFE9] dark:bg-[#0F172A] hover:bg-[#B25B3E] hover:text-white text-[#1D2B3A] dark:text-slate-200 border border-[#E5E1D8] dark:border-[#334155] transition-colors active:scale-95"
                    >
                      {sibling.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-3 left-3 sm:left-4 right-3 sm:right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none text-[10px] sm:text-[11px] font-sans">
        <div className="flex items-center gap-2.5 sm:gap-3 bg-[#FCFAF6]/90 dark:bg-[#1E293B]/95 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#E5E1D8] dark:border-transparent shadow-2xs pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B25B3E]"></span>
            <span className="text-[#1D2B3A] dark:text-white font-semibold">{candidateDisplayName}</span>
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

      {!isTouchInteractive && (
        <div
          className="absolute inset-0 z-10 lg:hidden flex items-end justify-center pb-12 pointer-events-auto bg-slate-900/10 dark:bg-black/20 backdrop-blur-[1px]"
          style={{ touchAction: 'pan-y' }}
          onClick={() => setIsTouchInteractive(true)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsTouchInteractive(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FCFAF6]/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#E5E1D8] dark:border-[#334155] shadow-lg text-xs font-sans font-medium text-[#1D2B3A] dark:text-white active:scale-95 transition-all"
          >
            <Move3d className="w-4 h-4 text-[#B25B3E] dark:text-[#E07A5F]" />
            <span>Tap to Interact with 3D Graph</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(SkillGraph3D);
