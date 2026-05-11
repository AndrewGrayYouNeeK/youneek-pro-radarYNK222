import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function TornadoBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Tornado Particles + Vortex
    const particles = new THREE.BufferGeometry();
    const particleCount = 8000;
    const posArray = new Float32Array(particleCount * 3);
    const velocityArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i]     = (Math.random() - 0.5) * 40;
      posArray[i + 1] = (Math.random() - 0.5) * 60;
      posArray[i + 2] = (Math.random() - 0.5) * 40;

      velocityArray[i]     = 0;
      velocityArray[i + 1] = Math.random() * 0.8 + 0.3;
      velocityArray[i + 2] = 0;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const tornado = new THREE.Points(particles, material);
    scene.add(tornado);
    camera.position.z = 25;

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const positions = tornado.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];

        const angle = Math.atan2(z, x) + 0.015;
        const radius = Math.sqrt(x * x + z * z) * 0.985;

        positions[i]     = Math.cos(angle) * radius;
        positions[i + 2] = Math.sin(angle) * radius;
        positions[i + 1] += velocityArray[i + 1];

        if (positions[i + 1] > 30) positions[i + 1] = -30;
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
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      particles.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}