'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hyper3DCanvasProps {
  type?: 'coin' | 'diamond' | 'shield' | 'rocket' | 'chart';
  accentColor?: string;
  progress?: number;
}

export const Hyper3DCanvas: React.FC<Hyper3DCanvasProps> = ({
  type = 'coin',
  accentColor = '#facc15',
  progress = 0.5,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = 180;
    const height = 180;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Iluminação de estúdio neon
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(new THREE.Color(accentColor), 3, 20);
    pointLight1.position.set(3, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 20);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // 3. Geometria 3D baseada no tipo
    let geometry: THREE.BufferGeometry;
    if (type === 'diamond') {
      geometry = new THREE.OctahedronGeometry(1.3, 0);
    } else if (type === 'shield') {
      geometry = new THREE.DodecahedronGeometry(1.25, 0);
    } else if (type === 'chart') {
      geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    } else {
      // 'coin' / ouro dourado
      geometry = new THREE.CylinderGeometry(1.3, 1.3, 0.28, 36);
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accentColor),
      metalness: 0.92,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = 0.4;
    meshRef.current = mesh;
    scene.add(mesh);

    renderer.render(scene, camera);

    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.innerHTML = '';
    };
  }, [type, accentColor]);

  // Atualiza rotação física com o progresso do frame
  useEffect(() => {
    if (meshRef.current && rendererRef.current && sceneRef.current) {
      const mesh = meshRef.current;
      mesh.rotation.y = (progress || 0) * Math.PI * 4;
      mesh.rotation.x = 0.35 + Math.sin((progress || 0) * Math.PI * 2) * 0.25;
      mesh.position.y = Math.sin((progress || 0) * Math.PI * 3) * 0.15;

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 4.2;
      rendererRef.current.render(sceneRef.current, camera);
    }
  }, [progress]);

  return (
    <div className="w-[180px] h-[180px] flex items-center justify-center relative pointer-events-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
      <div ref={mountRef} className="w-[180px] h-[180px]" />
    </div>
  );
};
