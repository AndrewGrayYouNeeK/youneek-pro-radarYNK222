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

    const particleCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = Math.random() * 22 + 2;
      const angle = Math.random() * Math.PI * 2;
      
      positions[i]     = Math.cos(angle) * radius;
      positions[i + 1] = (Math.random() - 0.5) * 95 - 15;
      positions[i + 2] = Math.sin(angle) * radius;

      // Cyan → White → Teal gradient
      const shade = Math.random();
      colors[i]     = 0.1 + shade * 0.6;     // R
      colors[i + 1] = 0.9 + shade * 0.1;     // G  (very strong green)
      colors[i + 2] = 0.8 + shade * 0.2;     // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    const tornado = new THREE.Points(geometry, material);
    scene.add(tornado);
    camera.position.z = 48;

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      const pos = tornado.geometry.attributes.position.array;

      for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const z = pos[i + 2];
        const angle = Math.atan2(z, x) + 0.028;   // swirl speed
        const radius = Math.hypot(x, z) * 0.977;

        pos[i]     = Math.cos(angle) * radius;
        pos[i + 2] = Math.sin(angle) * radius;
        pos[i + 1] += 1.35;   // faster upward movement

        if (pos[i + 1] > 55) pos[i + 1] = -50;
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
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
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
        background: '#0a0a0f'
      }}
    />
  );
}