import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const cacheDir = join(root, "node_modules/.cache");
mkdirSync(cacheDir, { recursive: true });

async function load(entry, name) {
  const outfile = join(cacheDir, `${name}-${process.pid}.mjs`);
  await build({
    absWorkingDir: root,
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    jsx: "automatic",
    external: ["react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom", "react-dom/server"],
    logLevel: "silent",
  });
  const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  rmSync(outfile, { force: true });
  return mod;
}

const { default: LayerSheet } = await load("src/components/radar/LayerSheet.jsx", "layer-sheet");
const { default: PremiumOnly } = await load("src/components/premium/PremiumOnly.jsx", "premium-only");
const { default: PremiumPill } = await load("src/components/premium/PremiumPill.jsx", "premium-pill");

const read = (path) => readFileSync(join(root, path), "utf8");

function sheet(premium) {
  return renderToStaticMarkup(
    createElement(LayerSheet, {
      stations: ["MOSAIC"],
      station: "MOSAIC",
      productId: "reflectivity",
      radarOn: true,
      futureOn: false,
      satelliteMode: "off",
      surfaceField: "off",
      toggles: {},
      onToggle() {},
      onProductChange() {},
      onRadarChange() {},
      onFutureChange() {},
      onStationChange() {},
      onSatelliteMode() {},
      onSurfaceField() {},
      premium,
    })
  );
}

test("web layer sheet shows only radar and warnings unlocked", () => {
  const html = sheet(false);
  const lockedLabels = [...html.matchAll(/data-locked="premium"[^>]*aria-label="([^":]+):/g)].map((m) => m[1]);
  for (const label of [
    "Future", "Single NEXRAD sites", "Visible", "Infrared", "Water vapor", "Temperature", "Wind", "Precip",
    "Storm reports", "Storm cells", "Hurricanes", "Fire detects", "Fire perimeters", "Snow", "Air quality",
    "Earthquakes", "Fronts", "SPC Day 1", "SPC Day 2", "SPC Day 3", "Mesoscale", "Winter", "Heat", "Wind alert", "Fire weather",
  ]) {
    assert.ok(lockedLabels.includes(label), label);
  }
  assert.ok(lockedLabels.some((label) => /velocity/i.test(label)), "velocity locked");
  for (const label of ["Radar", "Reflectivity", "Tornado", "Severe", "Tornado watch", "Severe watch", "Flood"]) {
    assert.equal(lockedLabels.includes(label), false, label);
  }
  assert.match(html, /data-premium-note="web"/);
  assert.match(html, /href="https:\/\/youneekproradar\.com"/);
});

test("native layer sheet shows every layer unlocked", () => {
  const html = sheet(true);
  assert.equal(html.includes('data-locked="premium"'), false);
  assert.equal(html.includes("data-premium-note"), false);
  assert.match(html, /Velocity|velocity/);
});

test("PremiumOnly hides premium on web and shows it in the app", () => {
  const child = createElement("span", null, "PREMIUM");
  assert.equal(renderToStaticMarkup(createElement(PremiumOnly, { premium: false }, child)), "");
  assert.equal(renderToStaticMarkup(createElement(PremiumOnly, { premium: true }, child)), "<span>PREMIUM</span>");
  const pill = renderToStaticMarkup(createElement(PremiumPill));
  assert.match(pill, /Premium in the app/);
  assert.match(pill, /Get the App/);
  assert.match(pill, /href="https:\/\/youneekproradar\.com"/);
});

test("radar, app shell, and pages gate premium UI with PREMIUM_UNLOCKED only", () => {
  const radar = read("src/components/radar/RadarDisplay.jsx");
  assert.match(radar, /radarProductFor\(settings\.product\)/);
  assert.match(radar, /PREMIUM_UNLOCKED \? <RainArrivalAlert \/> : <PremiumPill \/>/);
  assert.match(radar, /const showSafetyTexts = PREMIUM_UNLOCKED && Boolean\(primarySafetyAlert\)/);
  assert.match(radar, /PREMIUM_UNLOCKED && stormData/);
  assert.match(radar, /paint\(tornadoLayerRef, "tornado", showTornado\)/);
  assert.match(radar, /paint\(thunderLayerRef, "severe", showThunderstorm\)/);
  assert.match(radar, /paint\(floodLayerRef, "flood", showFlood, PREMIUM_UNLOCKED \? undefined : isFreeFloodFeature\)/);
  assert.match(radar, /paint\(winterLayerRef, "winter", PREMIUM_UNLOCKED && showWinter\)/);
  assert.match(radar, /useState\(\(\) => PREMIUM_UNLOCKED && loadRadarLayers\(\)\.storms\)/);
  const app = read("src/App.jsx");
  assert.match(app, /PREMIUM_UNLOCKED && typeof window !== "undefined" && shouldShowSafetyOnboarding/);
  assert.match(app, /if \(isPathFree\(pathname\)\) return <Outlet \/>;/);
  assert.match(app, /<Navigate to="\/Radar" replace \/>/);
  assert.match(app, /<WebGate \/>/);
  assert.match(read("src/lib/premium.js"), /isNativePlatform\(\)/);
});
