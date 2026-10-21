import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("wrangler.toml stays the YNK222 weather Worker and does not claim a custom domain", () => {
  const toml = readFileSync(join(root, "wrangler.toml"), "utf8");
  assert.match(toml, /^name = "youneek-pro-radarynk222"$/m);
  assert.doesNotMatch(toml, /^\[env\./m);
  assert.doesNotMatch(toml, /custom_domain/);
  assert.doesNotMatch(toml, /youneekproradar\.com/);
  assert.doesNotMatch(toml, /CLOUDFLARE_WORKER_NAME|WORKER_PROJECT\s*=/);
  assert.doesNotMatch(toml, /^SITE_ROLE\s*=/m);
});

test("no extra wrangler*.toml files that Workers Builds would treat as the project", () => {
  const extras = readdirSync(root).filter(
    (name) => /^wrangler.*\.(toml|json|jsonc)$/.test(name) && name !== "wrangler.toml"
  );
  assert.deepEqual(extras, []);
});

test("Workers assets are not given a Pages _redirects file", () => {
  assert.equal(existsSync(join(root, "public/_redirects")), false);
});

test("weather Worker serves point alerts and WeatherKit status, and has no landing build", () => {
  const worker = readFileSync(join(root, "worker/index.js"), "utf8");
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const vite = readFileSync(join(root, "vite.config.js"), "utf8");
  assert.match(worker, /\/api\/point-alerts/);
  assert.match(worker, /\/api\/weather-status/);
  assert.match(pkg.scripts.build, /^vite build$/);
  assert.equal(pkg.scripts["build:landing"], undefined);
  assert.equal(pkg.scripts["deploy:landing"], undefined);
  assert.equal(pkg.scripts["deploy:website"], undefined);
  assert.equal(pkg.scripts.deploy, "wrangler deploy");
  assert.doesNotMatch(vite, /dist-landing/);
  assert.doesNotMatch(vite, /landing-main/);
  assert.equal(existsSync(join(root, "src/landing-main.jsx")), false);
  assert.equal(existsSync(join(root, "src/pages/Landing.jsx")), false);
  assert.equal(existsSync(join(root, "scripts/deploy-website.mjs")), false);
});
