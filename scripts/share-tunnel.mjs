#!/usr/bin/env node
/**
 * One-command Cloudflare Tunnel: starts the app on :8000, installs cloudflared
 * if needed, and prints a public https://*.trycloudflare.com URL.
 *
 * No Cloudflare login, UUID, DNS record, or second terminal required.
 * Optional: TUNNEL_TOKEN for a named remotely-managed tunnel.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createConnection } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bin as cloudflaredBin, install as installCloudflared } from "cloudflared";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 8000;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const CONFIG_PATH = process.env.TUNNEL_CONFIG || path.join(ROOT, "cloudflared/config.yml");
const URL_FILE = path.join(ROOT, ".tunnel-url");
const QUICK_URL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

const children = [];
let shuttingDown = false;

function log(message) {
  process.stdout.write(`${message}\n`);
}

function waitForPort(port, timeoutMs = 90_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = createConnection({ host: "127.0.0.1", port }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        if (Date.now() - started >= timeoutMs) {
          reject(new Error(`Timed out waiting for ${ORIGIN}`));
          return;
        }
        setTimeout(attempt, 250);
      });
    };
    attempt();
  });
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

function track(child) {
  children.push(child);
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const name = child.spawnfile || "child";
    if (code && code !== 0) {
      log(`${path.basename(name)} exited (${code}${signal ? `/${signal}` : ""}).`);
      shutdown(code);
    }
  });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(code), 400).unref();
}

function namedConfigReady(configPath) {
  if (!existsSync(configPath)) return false;
  const text = readFileSync(configPath, "utf8");
  if (text.includes("<Tunnel-UUID>")) return false;
  const cred = text.match(/^credentials-file:\s*(.+)\s*$/m)?.[1]?.trim();
  if (cred && !existsSync(cred)) return false;
  const uuid = text.match(/^tunnel:\s*(.+)\s*$/m)?.[1]?.trim();
  return Boolean(uuid);
}

async function ensureBinary() {
  if (!existsSync(cloudflaredBin)) {
    log("Installing the official cloudflared binary…");
    await installCloudflared(cloudflaredBin);
  }
  return cloudflaredBin;
}

function startVite() {
  const viteJs = path.join(ROOT, "node_modules/vite/bin/vite.js");
  log(`Starting the app at ${ORIGIN}…`);
  return track(
    spawn(process.execPath, [viteJs, "--port", String(PORT), "--strictPort"], {
      cwd: ROOT,
      env: {
        ...process.env,
        CLOUDFLARE_TUNNEL: "1",
        PORT: String(PORT),
      },
      stdio: "inherit",
    }),
  );
}

function announce(url) {
  writeFileSync(URL_FILE, `${url}\n`);
  log("");
  log("========================================");
  log(`Public URL: ${url}`);
  log(`Origin:     ${ORIGIN}`);
  log("========================================");
  log("Leave this running. Ctrl+C stops the tunnel.");
  log("");
}

function startCloudflared(binPath) {
  const token = process.env.TUNNEL_TOKEN;
  const useNamed = !token && namedConfigReady(CONFIG_PATH);
  const args = token
    ? ["tunnel", "--no-autoupdate", "run", "--token", token]
    : useNamed
      ? ["tunnel", "--no-autoupdate", "--config", CONFIG_PATH, "run"]
      : ["tunnel", "--no-autoupdate", "--url", ORIGIN];

  if (token) {
    log("Connecting named tunnel from TUNNEL_TOKEN…");
  } else if (useNamed) {
    log(`Connecting named tunnel from ${path.relative(ROOT, CONFIG_PATH)}…`);
  } else {
    log("Opening a Quick Tunnel (no Cloudflare login required)…");
  }

  const child = track(
    spawn(binPath, args, {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );

  let announced = false;
  const onChunk = (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);
    if (announced) return;
    const match = text.match(QUICK_URL_RE);
    if (match) {
      announced = true;
      announce(match[0]);
    }
  };
  child.stdout.on("data", onChunk);
  child.stderr.on("data", onChunk);

  return child;
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const alreadyUp = await portOpen(PORT);
if (!alreadyUp) {
  startVite();
} else {
  log(`Reusing the app already listening on ${ORIGIN}.`);
}

await waitForPort(PORT);
const binPath = await ensureBinary();
startCloudflared(binPath);
