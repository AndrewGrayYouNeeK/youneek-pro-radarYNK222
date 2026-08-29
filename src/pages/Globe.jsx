import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function Globe() {
  useTabPageMemory("Globe");
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1.8;
    controls.maxDistance = 6;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 2, 3);
    scene.add(sun);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x1d4ed8,
        emissive: 0x0f172a,
        shininess: 8,
      })
    );
    scene.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 48, 48),
      new THREE.MeshPhongMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.12,
      })
    );
    scene.add(clouds);

    const strikesGroup = new THREE.Group();
    scene.add(strikesGroup);
    const stormsGroup = new THREE.Group();
    scene.add(stormsGroup);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(
      "https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg",
      (texture) => {
        earth.material.map = texture;
        earth.material.color = new THREE.Color(0xffffff);
        earth.material.needsUpdate = true;
      }
    );

    fetch("/api/lightning")
      .then((response) => response.json())
      .then((payload) => {
        (payload.strikes || []).slice(0, 80).forEach((strike) => {
          const marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.012, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
          );
          marker.position.copy(latLonToVector3(strike.lat, strike.lon, 1.04));
          strikesGroup.add(marker);
        });
      })
      .catch(() => {});

    fetch("/api/getActiveStorms")
      .then((response) => response.json())
      .then((payload) => {
        const storms = payload.activeStorms || payload.currentStorms || [];
        storms.forEach((storm) => {
          const lat = Number(storm.latitude ?? storm.lat);
          const lon = Number(storm.longitude ?? storm.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
          const marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xfb7185 })
          );
          marker.position.copy(latLonToVector3(lat, lon, 1.05));
          stormsGroup.add(marker);
        });
      })
      .catch(() => {});

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      earth.rotation.y += 0.0012;
      clouds.rotation.y += 0.0016;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 pb-0">
      <AppHeader title="Globe" />
      <div className="relative min-h-0 flex-1 pb-16">
        <div ref={mountRef} className="h-full w-full" />
        <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-xs text-slate-300">
          Drag to rotate. Lightning reports and active tropical cyclones plot on a night-side Earth — not a clone of another app’s globe.
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
