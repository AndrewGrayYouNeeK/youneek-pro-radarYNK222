import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function TornadoBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Brighter, more visible particles
    const particleCount = 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i]     = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 80 - 10;
      positions[i + 2] = (Math.random() - 0.5) * 50;

      // Cyan to white gradient
      colors[i]     = 0.0;
      colors[i + 1] = 0.9;
      colors[i + 2] = 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    const tornado = new THREE.Points(geometry, material);
    scene.add(tornado);

    camera.position.z = 35;

    let animationFrame;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const pos = tornado.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const z = pos[i + 2];
        const angle = Math.atan2(z, x) + 0.022;   // swirl speed
        const radius = Math.hypot(x, z) * 0.978;

        pos[i]     = Math.cos(angle) * radius;
        pos[i + 2] = Math.sin(angle) * radius;
        pos[i + 1] += 0.8;   // upward speed
        if (pos[i + 1] > 40) pos[i + 1] = -40;
      }

      tornado.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#0a0a0a'   // dark fallback
      }}
    />
  );
}