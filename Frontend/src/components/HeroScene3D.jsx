import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

export default function HeroScene3D({ scrollProgressRef }) {
  const containerRef = useRef(null);
  const { isDarkMode } = useTheme();
  const isDarkRef = useRef(isDarkMode);

  useEffect(() => {
    isDarkRef.current = isDarkMode;
  }, [isDarkMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isMobile = width < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const particleCount = isMobile ? 45 : 90;
    const dustPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 16;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.05,
      transparent: true,
      opacity: isDarkRef.current ? 0.38 : 0.28,
      color: new THREE.Color(isDarkRef.current ? '#CBD5E1' : '#8A847C')
    });
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    rootGroup.add(dustPoints);

    const constellationGroup = new THREE.Group();
    rootGroup.add(constellationGroup);

    const nodeCount = 18;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 3.6 + (i % 3) * 0.4;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const isTerracotta = i % 3 === 0;
      const isEmerald = i % 3 === 1;
      const nodeColor = isTerracotta
        ? (isDarkRef.current ? '#E07A5F' : '#B25B3E')
        : isEmerald
          ? (isDarkRef.current ? '#10B981' : '#047857')
          : (isDarkRef.current ? '#94A3B8' : '#8A847C');

      const geom = new THREE.SphereGeometry(0.045, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(nodeColor),
        transparent: true,
        opacity: isDarkRef.current ? 0.45 : 0.32
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      constellationGroup.add(mesh);

      nodes.push({
        basePos: new THREE.Vector3(x, y, z),
        mesh,
        material: mat,
        isTerracotta,
        isEmerald
      });
    }

    const linePairs = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodes[i].basePos.distanceTo(nodes[j].basePos) < 2.2) {
          linePairs.push({ a: i, b: j });
        }
      }
    }

    const linePositions = new Float32Array(linePairs.length * 6);
    let lineIdx = 0;
    for (const pair of linePairs) {
      const posA = nodes[pair.a].basePos;
      const posB = nodes[pair.b].basePos;
      linePositions[lineIdx++] = posA.x;
      linePositions[lineIdx++] = posA.y;
      linePositions[lineIdx++] = posA.z;
      linePositions[lineIdx++] = posB.x;
      linePositions[lineIdx++] = posB.y;
      linePositions[lineIdx++] = posB.z;
    }

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(isDarkRef.current ? '#94A3B8' : '#5C5751'),
      transparent: true,
      opacity: isDarkRef.current ? 0.22 : 0.15
    });
    const constellationLines = new THREE.LineSegments(lineGeom, lineMat);
    constellationGroup.add(constellationLines);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onPointerMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width < 768;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    };
    window.addEventListener('resize', onResize);

    let isDocumentVisible = !document.hidden;
    const onVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let animationFrameId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDocumentVisible) return;

      const isDark = isDarkRef.current;
      dustMaterial.color.set(isDark ? '#CBD5E1' : '#8A847C');
      dustMaterial.opacity = isDark ? 0.38 : 0.28;

      lineMat.color.set(isDark ? '#94A3B8' : '#5C5751');
      lineMat.opacity = isDark ? 0.22 : 0.15;

      nodes.forEach((node) => {
        const c = node.isTerracotta
          ? (isDark ? '#E07A5F' : '#B25B3E')
          : node.isEmerald
            ? (isDark ? '#10B981' : '#047857')
            : (isDark ? '#94A3B8' : '#8A847C');
        node.material.color.set(c);
        node.material.opacity = isDark ? 0.45 : 0.32;
      });

      mouseX = THREE.MathUtils.lerp(mouseX, targetMouseX, 0.04);
      mouseY = THREE.MathUtils.lerp(mouseY, targetMouseY, 0.04);

      const p = Math.max(0, Math.min(1, scrollProgressRef?.current ?? 0));

      dustPoints.rotation.y += 0.0003;
      dustPoints.rotation.x += 0.0001;

      constellationGroup.rotation.y += 0.0008;
      constellationGroup.rotation.z += 0.0004;

      if (!prefersReduced) {
        rootGroup.rotation.x = mouseY * 0.12;
        rootGroup.rotation.y = mouseX * 0.15;
      }

      rootGroup.position.y = -p * 2.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
