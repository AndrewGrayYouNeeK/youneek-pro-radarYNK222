import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "build" || name === ".gradle") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, found);
    else if (/\.(js|jsx|java|xml|gradle|json|md|properties)$/.test(name)) found.push(path);
  }
  return found;
}

test("Android scripts exist and the iOS scripts stay iOS-only", () => {
  const pkg = JSON.parse(read("package.json"));
  const config = JSON.parse(read("capacitor.config.json"));
  assert.equal(pkg.dependencies["@capacitor/android"], "^8.6.0");
  assert.equal(pkg.scripts["build:ios"], "npm run build && npx cap sync ios");
  assert.equal(pkg.scripts["cap:sync"], "npx cap sync ios");
  assert.equal(pkg.scripts["cap:open"], "npx cap open ios");
  assert.equal(pkg.scripts["build:android"], "npm run build && npx cap sync android");
  assert.equal(pkg.scripts["cap:sync:android"], "npx cap sync android");
  assert.equal(pkg.scripts["cap:open:android"], "npx cap open android");
  assert.equal(config.appId, "com.youneek.proradar");
  assert.equal(config.appName, "YouNeeK Pro Radar");
  assert.equal(config.server.androidScheme, "https");
  assert.equal(config.server.iosScheme, "capacitor");
});

test("the Android manifest is while-in-use location, no SMS send, and no tracking", () => {
  const manifest = read("android/app/src/main/AndroidManifest.xml");
  const gradle = read("android/app/build.gradle");
  const strings = read("android/app/src/main/res/values/strings.xml");
  assert.match(gradle, /applicationId "com\.youneek\.proradar"/);
  assert.match(gradle, /namespace = "com\.youneek\.proradar"/);
  assert.match(strings, /<string name="app_name">YouNeeK Pro Radar<\/string>/);
  assert.match(strings, /<string name="custom_url_scheme">youneekproradar<\/string>/);
  assert.match(manifest, /android:scheme="youneekproradar"/);
  assert.match(manifest, /android.permission.ACCESS_COARSE_LOCATION/);
  assert.match(manifest, /android.permission.ACCESS_FINE_LOCATION/);
  assert.match(manifest, /android.hardware.location.gps" android:required="false"/);
  assert.match(manifest, /android:allowBackup="false"/);
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:scheme="sms"/);
  assert.doesNotMatch(manifest, /android\.permission\.ACCESS_BACKGROUND_LOCATION/);
  assert.doesNotMatch(manifest, /android\.permission\.SEND_SMS/);
  assert.doesNotMatch(manifest, /android\.permission\.RECEIVE_SMS/);
  assert.doesNotMatch(manifest, /android\.permission\.READ_CONTACTS/);
  assert.doesNotMatch(manifest, /com\.google\.android\.gms\.permission\.AD_ID/);
  const rules = read("android/app/src/main/res/xml/data_extraction_rules.xml");
  assert.match(rules, /<exclude domain="sharedpref" path="\." \/>/);
  const settings = read("android/app/src/main/java/com/youneek/proradar/AppSettingsPlugin.java");
  assert.match(settings, /app-settings/);
  assert.match(settings, /ACTION_APPLICATION_DETAILS_SETTINGS/);
  assert.match(read("docs/ANDROID.md"), /youneekproradar:\/\/safety-preview/);
  assert.match(read("docs/LAUNCH_CHECKLIST.md"), /Play Store/);
});

test("the Android project does not contain a private key or a tracking SDK", () => {
  const banned = [
    /BEGIN PRIVATE KEY/,
    /BEGIN EC PRIVATE KEY/,
    /googletagmanager/,
    /google-analytics/,
    /@sentry\//,
    /android\.permission\.ACCESS_BACKGROUND_LOCATION/,
    /android\.permission\.SEND_SMS/,
    /com\.google\.android\.gms\.permission\.AD_ID/,
  ];
  for (const file of walk(join(root, "android"))) {
    const text = readFileSync(file, "utf8");
    for (const pattern of banned) {
      assert.equal(pattern.test(text), false, `${file} matched ${pattern}`);
    }
  }
});
