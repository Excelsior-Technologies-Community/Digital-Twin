import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { RotateCcw } from 'lucide-react';

// WebGL Texture & SpriteText cache to prevent GPU VRAM exhaustion during render loops
const spriteCache = new Map();

// Comprehensive dictionary of technical skills & architectural concepts to search for
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

// Fallback curated skills when bio has minimal text
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

export default function SkillGraph3D({ resumeData }) {
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 420 });

  // Handle container resizing for responsive 3D canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        const clientWidth = containerRef.current.clientWidth;
        setDimensions({
          width: clientWidth > 0 ? clientWidth : 700,
          height: 420
        });
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Parse candidate skills from resume bio or summary
  const graphData = useMemo(() => {
    const candidateName = resumeData?.name || 'Candidate';
    const textToScan = `${resumeData?.bio || ''} ${resumeData?.summary || ''}`.toLowerCase();

    // Find all skills mentioned in the resume
    const extractedSkills = RECOGNIZED_SKILLS.filter((skill) => {
      const lower = skill.toLowerCase();
      // Use word boundary check or simple inclusion for compound words
      return textToScan.includes(lower);
    });

    // Ensure we have an impactful cluster of at least 6-8 skills
    const finalSkillsList =
      extractedSkills.length >= 4
        ? Array.from(new Set([...extractedSkills, 'Gemini AI']))
        : DEFAULT_SKILLS;

    // Center node ('Me')
    const nodes = [
      {
        id: 'Me',
        name: candidateName,
        role: 'Central Persona Core',
        color: '#B25B3E', // Terracotta Rust
        val: 22
      }
    ];

    // Child nodes for each skill
    finalSkillsList.forEach((skill) => {
      nodes.push({
        id: skill,
        name: skill,
        role: 'Verified Technical Competency',
        color: '#1D2B3A', // Slate Navy
        val: 11
      });
    });

    // Primary Links: Connect 'Me' to each skill
    const links = finalSkillsList.map((skill) => ({
      source: 'Me',
      target: skill
    }));

    // Secondary semantic links to build a connected cluster
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
  }, [resumeData?.name, resumeData?.bio, resumeData?.summary]);

  const handleResetCamera = () => {
    if (fgRef.current) {
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 240 }, { x: 0, y: 0, z: 0 }, 1000);
    }
  };

  return (
    <div className="relative w-full overflow-hidden select-none" ref={containerRef}>
      {/* 3D Force Graph Render */}
      {dimensions.width > 0 ? (
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#F3EFE9" // Sand Canvas Theme
          nodeColor={(node) => node.color}
          nodeVal={(node) => node.val}
          nodeResolution={24}
          nodeLabel={(node) => `
            <div style="background:#1D2B3A; color:#FCFAF6; padding:6px 10px; border-radius:8px; font-family:'DM Sans', sans-serif; font-size:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15); border:1px solid #E5E1D8;">
              <span style="font-weight:700; color:${node.color === '#B25B3E' ? '#E59B82' : '#FCFAF6'}; display:block;">
                ${node.name}
              </span>
              <span style="font-size:10px; color:#A7A196;">
                ${node.id === 'Me' ? 'Digital Twin Core' : 'Skill Node'}
              </span>
            </div>
          `}
          linkColor={() => '#E5E1D8'} // Subtle organic border color
          linkWidth={1.5}
          linkOpacity={0.8}
          nodeThreeObjectExtend={true}
          nodeThreeObject={(node) => {
            const cacheKey = `${node.id}_${node.name || ''}`;
            if (spriteCache.has(cacheKey)) {
              return spriteCache.get(cacheKey);
            }

            const sprite = new SpriteText(node.name || node.id);

            // Slate Navy text color
            sprite.color = '#1D2B3A';

            // Add Paper White background box for clear visibility
            sprite.backgroundColor = '#FCFAF6';
            sprite.borderColor = '#E5E1D8';
            sprite.borderWidth = 1;
            sprite.padding = [4, 2];
            sprite.borderRadius = 4;

            sprite.textHeight = node.id === 'Me' ? 5 : 4;
            sprite.fontFace = 'DM Sans, sans-serif';
            sprite.fontWeight = 'bold';

            // Push the text further down so it doesn't overlap with the node sphere
            sprite.position.y = node.id === 'Me' ? -15 : -10;

            spriteCache.set(cacheKey, sprite);
            return sprite;
          }}
          showNavInfo={false}
          enableNodeDrag={true}
          enableNavigationControls={true}
        />
      ) : (
        <div className="h-[420px] flex items-center justify-center bg-[#F3EFE9] text-[#5C5751] text-xs font-serif">
          Initializing 3D spatial canvas...
        </div>
      )}

      {/* Interactive Overlay & Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10 pointer-events-auto">
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-lg bg-[#FCFAF6] hover:bg-[#E5E1D8] text-[#1D2B3A] border border-[#E5E1D8] shadow-xs transition-colors flex items-center gap-1.5 text-xs font-serif font-medium"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#B25B3E]" />
          <span className="hidden sm:inline">Reset View</span>
        </button>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none text-[11px] font-sans">
        <div className="flex items-center gap-3 bg-[#FCFAF6]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[#E5E1D8] shadow-2xs pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B25B3E]"></span>
            <span className="text-[#1D2B3A] font-semibold">{resumeData?.name || 'Me'}</span>
          </div>
          <span className="text-[#E5E1D8]">&bull;</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D2B3A]"></span>
            <span className="text-[#5C5751]">Skills & Systems ({graphData.nodes.length - 1})</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-[#FCFAF6]/80 backdrop-blur px-3 py-1.5 rounded-lg border border-[#E5E1D8] text-[#5C5751] shadow-2xs">
          <span>Rotate: Left Click + Drag</span>
          <span className="text-[#E5E1D8]">&bull;</span>
          <span>Zoom: Scroll</span>
          <span className="text-[#E5E1D8]">&bull;</span>
          <span>Pan: Right Click</span>
        </div>
      </div>
    </div>
  );
}
