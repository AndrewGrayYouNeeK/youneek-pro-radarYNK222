import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRIVACY_POLICY_PARAGRAPHS } from "../../src/content/privacyPolicy.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function pngSize(path) {
  const bytes = readFileSync(join(root, path));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test("Capacitor names the iOS app and the npm scripts stay deploy-safe", () => {
  const config = JSON.parse(read("capacitor.config.json"));
  const pkg = JSON.parse(read("package.json"));
  assert.equal(config.appId, "com.youneek.proradar");
  assert.equal(config.appName, "YouNeeK Pro Radar");
  assert.equal(config.webDir, "dist");
  assert.equal(pkg.scripts.build, "vite build");
  assert.match(pkg.scripts["build:ios"], /cap sync ios/);
  assert.equal(pkg.scripts["cap:sync"], "npx cap sync ios");
  assert.equal(pkg.scripts["cap:open"], "npx cap open ios");
  assert.doesNotMatch(JSON.stringify(config), /NSUserTracking|ATTracking|analytics/i);
});

test("Info.plist asks for When In Use location, forces dark UI, and does not track", () => {
  const plist = read("ios/App/App/Info.plist");
  assert.ok(
    plist.includes(
      "YouNeeK Pro Radar needs your location to show radar and alerts for your area and to include your coordinates in the I’m Sheltering emergency text."
    )
  );
  assert.match(plist, /<key>UIUserInterfaceStyle<\/key>\s*<string>Dark<\/string>/);
  assert.match(plist, /UIStatusBarStyleLightContent/);
  assert.match(plist, /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/);
  assert.match(plist, /<string>youneekproradar<\/string>/);
  assert.doesNotMatch(plist, /NSLocationAlways/);
  assert.doesNotMatch(plist, /NSUserTrackingUsageDescription/);
  assert.doesNotMatch(plist, /UIBackgroundModes/);
  const project = read("ios/App/App.xcodeproj/project.pbxproj");
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = com\.youneek\.proradar;/);
  assert.match(project, /PrivacyInfo\.xcprivacy/);
});

test("the privacy manifest declares UserDefaults and turns tracking off", () => {
  const manifest = read("ios/App/App/PrivacyInfo.xcprivacy");
  assert.match(manifest, /<key>NSPrivacyTracking<\/key>\s*<false\/>/);
  assert.match(manifest, /NSPrivacyAccessedAPICategoryUserDefaults/);
  assert.match(manifest, /<string>CA92\.1<\/string>/);
  assert.match(manifest, /NSPrivacyCollectedDataTypePreciseLocation/);
  assert.doesNotMatch(manifest, /NSPrivacyCollectedDataTypeTracking<\/key>\s*<true\/>/);
  const icons = JSON.parse(read("ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json"));
  assert.equal(icons.images.length, 3);
  assert.deepEqual(pngSize("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"), { width: 1024, height: 1024 });
  assert.deepEqual(pngSize("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-dark.png"), { width: 1024, height: 1024 });
  assert.deepEqual(pngSize("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-tinted.png"), { width: 1024, height: 1024 });
});

test("the public privacy page matches the in-app policy", () => {
  const html = read("public/privacy.html");
  const worker = read("worker/index.js");
  for (const paragraph of PRIVACY_POLICY_PARAGRAPHS) {
    assert.ok(html.includes(paragraph), paragraph.slice(0, 48));
  }
  assert.match(worker, /pathname === "\/privacy"/);
  assert.match(worker, /applyCors/);
  assert.doesNotMatch(worker, /Access-Control-Allow-Origin": "\*"/);
});

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git" || name === "public") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, found);
    else if (/\.(js|jsx|html|plist|json|md|swift|xml|xcprivacy)$/.test(name)) found.push(path);
  }
  return found;
}

test("the app bundle sources do not contain a private key or a tracking SDK", () => {
  const banned = [/BEGIN PRIVATE KEY/, /BEGIN EC PRIVATE KEY/, /ATTrackingManager/, /NSUserTrackingUsageDescription/, /googletagmanager/, /google-analytics/, /@sentry\//];
  for (const dir of ["src", "public", "ios"]) {
    for (const file of walk(join(root, dir))) {
      const text = readFileSync(file, "utf8");
      for (const pattern of banned) {
        assert.equal(pattern.test(text), false, `${file} matched ${pattern}`);
      }
    }
  }
});
