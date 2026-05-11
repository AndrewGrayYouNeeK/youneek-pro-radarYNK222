import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function TornadoBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = Math.random() * 18 + 3;
      const angle = Math.random() * Math.PI * 2;
      
      positions[i]     = Math.cos(angle) * radius;           // x
      positions[i + 1] = (Math.random() - 0.5) * 90 - 10;   // y (very tall)
      positions[i + 2] = Math.sin(angle) * radius;           // z

      velocities[i/3] = Math.random() * 1.8 + 1.2;           // upward speed
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.13,
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    const tornado = new THREE.Points(geometry, material);
    scene.add(tornado);
    camera.position.z = 45;

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      const pos = tornado.geometry.attributes.position.array;

      for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const z = pos[i + 2];
        
        // Strong swirling
        const currentRadius = Math.hypot(x, z);
        const angle = Math.atan2(z, x) + 0.035;   // ← Increased swirl speed
        
        const targetRadius = currentRadius * 0.975; // Tighten into funnel shape
        
        pos[i]     = Math.cos(angle) * targetRadius;
        pos[i + 2] = Math.sin(angle) * targetRadius;
        
        // Move upward
        pos[i + 1] += velocities[i/3];
        if (pos[i + 1] > 50) pos[i + 1] = -45;
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
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
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
        pointerEvents: 'none'
      }}
    />
  );
}