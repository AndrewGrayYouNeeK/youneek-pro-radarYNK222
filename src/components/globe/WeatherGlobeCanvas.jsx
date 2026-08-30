import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { latLonToVector3 } from "@/lib/globe/math";
import { fetchRainviewerMaps, pickLoopFrames } from "@/lib/radar/rainviewer";
import { stitchRainviewerFrame } from "@/lib/radar/stitchTiles";

const EARTH_DAY = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const EARTH_NIGHT = "https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg";
const EARTH_BUMP = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

const overlayVertex = `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const overlayFragment = `
  uniform sampler2D overlayMap;
  uniform float opacity;
  varying vec3 vPosition;
  const float PI = 3.14159265359;
  void main() {
    vec3 n = normalize(vPosition);
    float lat = asin(clamp(n.y, -1.0, 1.0));
    float lon = atan(n.x, n.z);
    float x = (lon + PI) / (2.0 * PI);
    float mercN = log(tan(PI * 0.25 + clamp(lat, -1.484, 1.484) * 0.5));
    float y = 0.5 - mercN / (2.0 * PI);
    if (y < 0.0 || y > 1.0) discard;
    vec4 color = texture2D(overlayMap, vec2(fract(x), 1.0 - y));
    float luma = color.r + color.g + color.b;
    if (color.a < 0.04 && luma < 0.08) discard;
    gl_FragColor = vec4(color.rgb, max(color.a, 0.85) * opacity);
  }
`;

const atmosphereVertex = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(0.25, 0.55, 1.0, 1.0) * intensity;
  }
`;

function makeOverlayMaterial(texture, opacity) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return new THREE.ShaderMaterial({
    uniforms: {
      overlayMap: { value: texture },
      opacity: { value: opacity },
    },
    vertexShader: overlayVertex,
    fragmentShader: overlayFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}

function markerMesh(color, radius = 0.016) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 10, 10),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
  );
}

export default function WeatherGlobeCanvas({
  coords,
  layer = "radar",
  playing = true,
  showLightning = true,
  showStorms = true,
  showFires = true,
  flyToken = 0,
  onStatus,
}) {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 100);
    camera.position.set(0.4, 0.8, 3.05);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.55;
    controls.maxDistance = 6.2;
    controls.enablePan = false;

    const stars = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 900 }, () => {
          const vector = new THREE.Vector3().randomDirection().multiplyScalar(18 + Math.random() * 16);
          return vector;
        })
      ),
      new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.035 })
    );
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0x88aacc, 0.55));
    const sun = new THREE.DirectionalLight(0xfff4e6, 1.35);
    sun.position.set(5, 2.2, 3.4);
    scene.add(sun);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 80, 80),
      new THREE.MeshPhongMaterial({
        color: 0x1d4ed8,
        emissive: 0x020617,
        shininess: 12,
        specular: new THREE.Color(0x335577),
      })
    );
    scene.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.015, 48, 48),
      new THREE.MeshPhongMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      })
    );
    scene.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 48, 48),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      })
    );
    scene.add(atmosphere);

    const overlay = new THREE.Mesh(
      new THREE.SphereGeometry(1.028, 80, 80),
      makeOverlayMaterial(new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1), 0.82)
    );
    scene.add(overlay);

    const lightningGroup = new THREE.Group();
    const stormsGroup = new THREE.Group();
    const firesGroup = new THREE.Group();
    const userGroup = new THREE.Group();
    scene.add(lightningGroup, stormsGroup, firesGroup, userGroup);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(EARTH_DAY, (texture) => {
      earth.material.map = texture;
      earth.material.color = new THREE.Color(0xffffff);
      earth.material.needsUpdate = true;
    });
    textureLoader.load(EARTH_NIGHT, (texture) => {
      earth.material.emissiveMap = texture;
      earth.material.emissive = new THREE.Color(0x445566);
      earth.material.needsUpdate = true;
    });
    textureLoader.load(EARTH_BUMP, (texture) => {
      earth.material.bumpMap = texture;
      earth.material.bumpScale = 0.035;
      earth.material.needsUpdate = true;
    });

    const radarTextures = [];
    const satelliteTextures = [];
    const state = {
      playing: true,
      layer: "radar",
      frameIndex: 0,
      radarFrames: [],
      satelliteFrames: [],
      lastTick: 0,
    };

    const setOverlayTexture = (texture) => {
      if (!texture) return;
      overlay.material.uniforms.overlayMap.value = texture;
      overlay.material.uniforms.opacity.value = state.layer === "satellite" ? 0.62 : 0.86;
    };

    const applyFrame = () => {
      const pack = state.layer === "satellite" ? satelliteTextures : radarTextures;
      if (!pack.length) return;
      state.frameIndex = state.frameIndex % pack.length;
      setOverlayTexture(pack[state.frameIndex]);
      const frames = state.layer === "satellite" ? state.satelliteFrames : state.radarFrames;
      const frame = frames[state.frameIndex];
      statusRef.current?.({
        ready: true,
        layer: state.layer,
        frameTime: frame?.time || null,
        kind: frame?.kind || "live",
        frameLabel: frame?.time
          ? new Date(frame.time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : "Live",
      });
    };

    const canvasToTexture = (canvas) => {
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      return texture;
    };

    statusRef.current?.({ ready: false, layer: "radar", frameLabel: "Loading radar…" });

    fetchRainviewerMaps()
      .then(async (maps) => {
        const radarFrames = pickLoopFrames(maps.radar, 7);
        const satelliteFrames = pickLoopFrames(maps.satellite, 4);
        state.radarFrames = radarFrames;
        state.satelliteFrames = satelliteFrames;

        for (const frame of radarFrames) {
          const canvas = await stitchRainviewerFrame({ host: maps.host, path: frame.path, zoom: 2 });
          radarTextures.push(canvasToTexture(canvas));
          if (radarTextures.length === 1) {
            state.frameIndex = 0;
            applyFrame();
          }
        }

        for (const frame of satelliteFrames) {
          const canvas = await stitchRainviewerFrame({ host: maps.host, path: frame.path, zoom: 2 });
          satelliteTextures.push(canvasToTexture(canvas));
        }

        applyFrame();
      })
      .catch(() => {
        statusRef.current?.({ ready: false, layer: "radar", frameLabel: "Radar unavailable" });
      });

    fetch("/api/lightning")
      .then((response) => response.json())
      .then((payload) => {
        (payload.strikes || []).slice(0, 120).forEach((strike) => {
          const marker = markerMesh(strike.kind === "lightning" ? 0xfacc15 : 0xfb923c, 0.011);
          marker.position.copy(latLonToVector3(strike.lat, strike.lon, 1.04));
          lightningGroup.add(marker);
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
          const marker = markerMesh(0xfb7185, 0.028);
          marker.position.copy(latLonToVector3(lat, lon, 1.05));
          stormsGroup.add(marker);
        });
      })
      .catch(() => {});

    fetch("/api/wildfires")
      .then((response) => response.json())
      .then((payload) => {
        (payload.fires || []).slice(0, 80).forEach((fire) => {
          if (!Number.isFinite(fire.lat) || !Number.isFinite(fire.lon)) return;
          const marker = markerMesh(0xf97316, 0.013);
          marker.position.copy(latLonToVector3(fire.lat, fire.lon, 1.042));
          firesGroup.add(marker);
        });
      })
      .catch(() => {});

    const flyTo = (lat, lon) => {
      const target = latLonToVector3(lat, lon, 1);
      const cameraPos = target.clone().multiplyScalar(2.35);
      camera.position.copy(cameraPos);
      controls.target.copy(target.multiplyScalar(0.15));
      controls.update();
    };

    apiRef.current = {
      setPlaying: (value) => {
        state.playing = value;
      },
      setLayer: (value) => {
        state.layer = value;
        state.frameIndex = 0;
        applyFrame();
      },
      setOverlays: ({ lightning, storms, fires }) => {
        lightningGroup.visible = lightning;
        stormsGroup.visible = storms;
        firesGroup.visible = fires;
      },
      flyTo,
      setUser: (lat, lon) => {
        userGroup.clear();
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        const marker = markerMesh(0x38bdf8, 0.02);
        marker.position.copy(latLonToVector3(lat, lon, 1.045));
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.03, 0.038, 24),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
        );
        ring.position.copy(latLonToVector3(lat, lon, 1.046));
        ring.lookAt(0, 0, 0);
        userGroup.add(marker, ring);
      },
    };

    let frame = 0;
    const animate = (time) => {
      frame = requestAnimationFrame(animate);
      clouds.rotation.y += 0.00035;
      stars.rotation.y += 0.00008;
      if (state.playing && time - state.lastTick > 700) {
        state.lastTick = time;
        const pack = state.layer === "satellite" ? satelliteTextures : radarTextures;
        if (pack.length > 1) {
          state.frameIndex = (state.frameIndex + 1) % pack.length;
          applyFrame();
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate(0);

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      [...radarTextures, ...satelliteTextures].forEach((texture) => texture.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    apiRef.current.setPlaying?.(playing);
  }, [playing]);

  useEffect(() => {
    apiRef.current.setLayer?.(layer);
  }, [layer]);

  useEffect(() => {
    apiRef.current.setOverlays?.({ lightning: showLightning, storms: showStorms, fires: showFires });
  }, [showLightning, showStorms, showFires]);

  useEffect(() => {
    if (coords?.latitude != null && coords?.longitude != null) {
      apiRef.current.setUser?.(coords.latitude, coords.longitude);
    }
  }, [coords?.latitude, coords?.longitude]);

  useEffect(() => {
    if (flyToken && coords?.latitude != null && coords?.longitude != null) {
      apiRef.current.flyTo?.(coords.latitude, coords.longitude);
    }
  }, [flyToken, coords?.latitude, coords?.longitude]);

  return <div ref={mountRef} className="h-full w-full" />;
}
