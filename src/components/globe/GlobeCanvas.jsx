import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { sunLatLon } from "@/lib/geo";

const EARTH_NIGHT = "https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg";
const EARTH_DAY = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const EARTH_CLOUDS = "https://unpkg.com/three-globe@2.31.1/example/img/earth-clouds.png";

const radarVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const radarFrag = `
uniform sampler2D radarMap;
uniform float opacity;
uniform float lonOffset;
varying vec2 vUv;

void main() {
  float lat = (vUv.y - 0.5) * 180.0;
  float lon = vUv.x * 360.0 - 180.0 + lonOffset;
  if (abs(lat) > 85.0) discard;
  float latRad = lat * 3.141592653589793 / 180.0;
  float x = fract((lon + 180.0) / 360.0);
  float y = 0.5 - log(tan(0.7853981633974483 + latRad / 2.0)) / 6.283185307179586;
  vec4 color = texture2D(radarMap, vec2(x, 1.0 - y));
  float luma = color.r + color.g + color.b;
  if (color.a < 0.04 && luma < 0.08) discard;
  gl_FragColor = vec4(color.rgb, max(color.a, 0.85) * opacity);
}
`;

const atmoVert = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmoFrag = `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
  gl_FragColor = vec4(0.25, 0.55, 1.0, 1.0) * intensity;
}
`;

export function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function vector3ToLatLon(vector) {
  const radius = vector.length() || 1;
  const lat = 90 - (Math.acos(vector.y / radius) * 180) / Math.PI;
  const lon = (Math.atan2(vector.z, -vector.x) * 180) / Math.PI - 180;
  return { lat, lon };
}

function makeMarker(color, radius = 0.014) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 10, 10),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
  );
}

function clearGroup(group) {
  const children = [...group.children];
  children.forEach((child) => {
    group.remove(child);
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  });
}

const GlobeCanvas = forwardRef(function GlobeCanvas(
  {
    radarCanvas,
    radarOpacity = 0.85,
    lightning = [],
    storms = [],
    fires = [],
    userLocation,
    autoRotate = true,
    onPick,
  },
  ref
) {
  const mountRef = useRef(null);
  const apiRef = useRef({});

  useImperativeHandle(ref, () => ({
    flyTo(lat, lon) {
      apiRef.current.flyTo?.(lat, lon);
    },
  }));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0.4, 0.85, 2.85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.45;
    controls.maxDistance = 5.4;
    controls.enablePan = false;

    const planet = new THREE.Group();
    scene.add(planet);

    scene.add(new THREE.AmbientLight(0x7dd3fc, 0.28));
    const sun = new THREE.DirectionalLight(0xfff7ed, 1.55);
    const sunPos = sunLatLon();
    sun.position.copy(latLonToVector3(sunPos.lat, sunPos.lon, 6));
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x38bdf8, 0.25);
    fill.position.set(-4, -1, -3);
    scene.add(fill);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const r = 18 + Math.random() * 20;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.035 })));

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 80, 80),
      new THREE.MeshPhongMaterial({
        color: 0x1e3a8a,
        emissive: 0x020617,
        shininess: 12,
      })
    );
    planet.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.018, 56, 56),
      new THREE.MeshPhongMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      })
    );
    planet.add(clouds);

    const radarUniforms = {
      radarMap: { value: null },
      opacity: { value: radarOpacity },
      lonOffset: { value: 0 },
    };
    const radar = new THREE.Mesh(
      new THREE.SphereGeometry(1.032, 80, 80),
      new THREE.ShaderMaterial({
        uniforms: radarUniforms,
        vertexShader: radarVert,
        fragmentShader: radarFrag,
        transparent: true,
        depthWrite: false,
      })
    );
    radar.visible = false;
    planet.add(radar);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      })
    );
    scene.add(atmosphere);

    const lightningGroup = new THREE.Group();
    const stormsGroup = new THREE.Group();
    const firesGroup = new THREE.Group();
    const userGroup = new THREE.Group();
    planet.add(lightningGroup, stormsGroup, firesGroup, userGroup);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(EARTH_NIGHT, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      earth.material.map = texture;
      earth.material.color = new THREE.Color(0xffffff);
      earth.material.needsUpdate = true;
    });
    textureLoader.load(EARTH_DAY, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      earth.material.emissiveMap = texture;
      earth.material.emissive = new THREE.Color(0x334155);
      earth.material.needsUpdate = true;
    });
    textureLoader.load(EARTH_CLOUDS, (texture) => {
      clouds.material.map = texture;
      clouds.material.transparent = true;
      clouds.material.opacity = 0.32;
      clouds.material.needsUpdate = true;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(earth);
      if (!hits[0] || !onPick) return;
      const local = planet.worldToLocal(hits[0].point.clone());
      onPick(vector3ToLatLon(local));
    };
    renderer.domElement.addEventListener("click", onClick);

    apiRef.current = {
      radar,
      radarUniforms,
      lightningGroup,
      stormsGroup,
      firesGroup,
      userGroup,
      planet,
      autoRotate,
      radarTexture: null,
      flyTo(lat, lon) {
        const dest = latLonToVector3(lat, lon, 2.55);
        camera.position.copy(dest);
        controls.update();
      },
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (apiRef.current.autoRotate) {
        planet.rotation.y += 0.0009;
      }
      clouds.rotation.y += 0.0004;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      apiRef.current.radarTexture?.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [onPick]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api?.radar) return;
    api.radarUniforms.opacity.value = radarOpacity;
    if (!radarCanvas) {
      api.radar.visible = false;
      return;
    }
    if (api.radarTexture) api.radarTexture.dispose();
    const texture = new THREE.CanvasTexture(radarCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    api.radarTexture = texture;
    api.radarUniforms.radarMap.value = texture;
    api.radar.visible = true;
  }, [radarCanvas, radarOpacity]);

  useEffect(() => {
    const group = apiRef.current.lightningGroup;
    if (!group) return;
    clearGroup(group);
    lightning.slice(0, 120).forEach((strike) => {
      const marker = makeMarker(strike.kind === "storm" ? 0xfb923c : 0xfacc15, 0.011);
      marker.position.copy(latLonToVector3(strike.lat, strike.lon, 1.05));
      group.add(marker);
    });
  }, [lightning]);

  useEffect(() => {
    const group = apiRef.current.stormsGroup;
    if (!group) return;
    clearGroup(group);
    storms.forEach((storm) => {
      const lat = Number(storm.latitude ?? storm.lat);
      const lon = Number(storm.longitude ?? storm.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      const marker = makeMarker(0xfb7185, 0.028);
      marker.position.copy(latLonToVector3(lat, lon, 1.06));
      group.add(marker);
    });
  }, [storms]);

  useEffect(() => {
    const group = apiRef.current.firesGroup;
    if (!group) return;
    clearGroup(group);
    fires.slice(0, 180).forEach((fire) => {
      const lat = Number(fire.lat);
      const lon = Number(fire.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      const marker = makeMarker(0xf97316, 0.01);
      marker.position.copy(latLonToVector3(lat, lon, 1.045));
      group.add(marker);
    });
  }, [fires]);

  useEffect(() => {
    const group = apiRef.current.userGroup;
    if (!group) return;
    clearGroup(group);
    if (!userLocation) return;
    const marker = makeMarker(0x22d3ee, 0.018);
    marker.position.copy(latLonToVector3(userLocation.lat, userLocation.lon, 1.055));
    group.add(marker);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.03, 0.038, 32),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    ring.position.copy(latLonToVector3(userLocation.lat, userLocation.lon, 1.056));
    ring.lookAt(0, 0, 0);
    group.add(ring);
  }, [userLocation]);

  return <div ref={mountRef} className="h-full w-full" />;
});

export default GlobeCanvas;
