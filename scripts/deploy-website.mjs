#!/usr/bin/env node
/**
 * Publish the marketing landing page as its own Worker.
 * The weather app stays on youneek-pro-radarynk222 via `wrangler deploy`.
 * This script does not attach custom domains or change DNS.
 *
 * If Workers Builds invokes this script on the weather project, it deploys
 * that Worker instead of renaming it to the landing project.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const LANDING_PROJECT = "youneek-pro-radar-landing";
export const WEATHER_PROJECT = "youneek-pro-radarynk222";
const DEFAULT_WEATHER_APP_URL = "https://youneek-pro-radarynk222.youneekartifacts.workers.dev";

export function workersBuildsTarget(env = process.env) {
  if (env.WORKERS_CI !== "1" && !env.WRANGLER_CI_MATCH_TAG) return null;
  const connected = String(env.WRANGLER_CI_OVERRIDE_NAME || "").trim().toLowerCase();
  if (connected.includes("landing")) return "landing";
  return "weather";
}

export function workersBuildsPreview(env = process.env) {
  const branch = String(env.WORKERS_CI_BRANCH || "");
  return Boolean(branch) && branch !== "main";
}

function log(message) {
  console.log(message);
}

function wrangler(args) {
  log(`\n> npx wrangler ${args.join(" ")}`);
  const result = spawnSync("npx", ["wrangler", ...args], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status === 0;
}

export function landingWranglerToml(assetsDir, env = process.env) {
  const weatherAppUrl = String(env.WEATHER_APP_URL || DEFAULT_WEATHER_APP_URL).replace(/\/$/, "");
  return `name = "${LANDING_PROJECT}"
compatibility_date = "2024-09-23"
main = "./worker/index.js"

[assets]
directory = ${JSON.stringify(assetsDir)}
binding = "ASSETS"
not_found_handling = "single-page-application"
run_worker_first = true

[vars]
SITE_ROLE = "landing"
WORKER_PROJECT = "${LANDING_PROJECT}"
WEATHER_APP_URL = "${weatherAppUrl}"
`;
}

function ensureLandingBuild() {
  if (existsSync("dist-landing/index.html")) return true;
  log("dist-landing/ is missing. Building the landing site…");
  const result = spawnSync("npx", ["vite", "build", "--mode", "landing"], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status === 0 && existsSync("dist-landing/index.html");
}

export function main(env = process.env) {
  const buildsTarget = workersBuildsTarget(env);
  if (buildsTarget === "weather") {
    const cmd = workersBuildsPreview(env) ? ["versions", "upload"] : ["deploy"];
    log(`Workers Builds is connected to ${WEATHER_PROJECT}; publishing the weather app.`);
    return wrangler(cmd) ? 0 : 1;
  }

  const inCi = Boolean(env.CI || env.GITHUB_ACTIONS);
  if (inCi && !env.CLOUDFLARE_API_TOKEN && !env.WRANGLER_CI_MATCH_TAG) {
    log(
      `Skipping ${LANDING_PROJECT} landing deploy: CLOUDFLARE_API_TOKEN is not set.\n` +
        `Weather app: Cloudflare → ${WEATHER_PROJECT} → deploy command \`npx wrangler deploy\`\n` +
        `Landing page: npm run deploy:landing (separate Worker ${LANDING_PROJECT}, no DNS changes)`
    );
    return 0;
  }

  if (!ensureLandingBuild()) {
    console.error("Landing build failed. Run `npm run build:landing` and retry.");
    return 1;
  }

  const dir = mkdtempSync(join(tmpdir(), "ynk-landing-"));
  const configPath = join(dir, "wrangler.landing.toml");
  writeFileSync(configPath, landingWranglerToml(join(process.cwd(), "dist-landing"), env));

  log(`Publishing landing page to ${LANDING_PROJECT}…`);
  const landingCmd = workersBuildsPreview(env) ? ["versions", "upload"] : ["deploy"];
  if (wrangler([...landingCmd, "--config", configPath])) {
    log(`\nLanding Worker ${LANDING_PROJECT} updated. WeatherKit secrets stay on ${WEATHER_PROJECT}.`);
    log("No custom domain was attached. DNS for youneekproradar.com is unchanged.");
    return 0;
  }

  console.error(
    `\nCould not publish landing ${LANDING_PROJECT}.\n` +
      `Create a separate Cloudflare Worker named ${LANDING_PROJECT} and set its deploy command to \`npm run deploy:landing\`.\n` +
      `Do not point it at youneekproradar.com from this script.`
  );
  return 1;
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  process.exit(main());
}
