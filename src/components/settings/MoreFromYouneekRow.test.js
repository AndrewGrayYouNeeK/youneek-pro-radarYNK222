import assert from "node:assert/strict";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const cacheDir = join(root, "node_modules/.cache");
mkdirSync(cacheDir, { recursive: true });
const outfile = join(cacheDir, `more-from-youneek-row-${process.pid}.mjs`);

await build({
  absWorkingDir: root,
  entryPoints: ["src/components/settings/MoreFromYouneekRow.jsx"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  jsx: "automatic",
  external: ["react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom", "react-dom/server"],
  logLevel: "silent",
});

const rowModule = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
rmSync(outfile, { force: true });

const { default: MoreFromYouneekRow, openYouneekSite, YOUNEEK_SITE_URL } = rowModule;

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function sourceFiles(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) sourceFiles(path, found);
    else if (/\.(js|jsx|mjs|ts|tsx)$/.test(name)) found.push(path);
  }
  return found;
}

test("the More from YouNeeK row renders in About and links to https://youneek.xyz", () => {
  assert.equal(YOUNEEK_SITE_URL, "https://youneek.xyz");
  const url = new URL(YOUNEEK_SITE_URL);
  assert.equal(url.origin, "https://youneek.xyz");
  assert.equal(url.pathname, "/");
  assert.equal(url.search, "");
  assert.equal(url.hash, "");

  const html = renderToStaticMarkup(createElement(MoreFromYouneekRow));
  assert.match(html, /More from YouNeeK/);
  assert.match(html, /Other apps by Andrew Gray/);
  assert.match(html, /href="https:\/\/youneek\.xyz"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /lucide-external-link/);
  assert.doesNotMatch(html, /utm_|analytics|gtag|No ads/);

  const element = MoreFromYouneekRow();
  assert.equal(element.props.href, "https://youneek.xyz");
  assert.equal(element.props.target, "_blank");
  assert.equal(element.props.rel, "noopener noreferrer");

  const opened = [];
  const previousWindow = globalThis.window;
  globalThis.window = {
    open(targetUrl, target, features) {
      const popup = { opener: "still-set" };
      opened.push({ targetUrl, target, features, popup });
      return popup;
    },
  };
  try {
    assert.equal(opened.length, 0);
    let prevented = false;
    const didOpen = element.props.onClick({
      preventDefault() {
        prevented = true;
      },
    });
    assert.equal(didOpen, true);
    assert.equal(prevented, true);
    assert.equal(opened.length, 1);
    assert.equal(opened[0].targetUrl, "https://youneek.xyz");
    assert.equal(opened[0].target, "_blank");
    assert.equal(opened[0].features, "noopener,noreferrer");
    assert.equal(opened[0].popup.opener, null);
    assert.equal(openYouneekSite, element.props.onClick);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }

  const settings = read("src/pages/Settings.jsx");
  const aboutStart = settings.indexOf('<Section title="About">');
  const aboutEnd = settings.indexOf('<Section title="Data">');
  assert.ok(aboutStart !== -1 && aboutEnd > aboutStart);
  const about = settings.slice(aboutStart, aboutEnd);
  const versionAt = about.indexOf("Version ${APP_VERSION} — by Andrew Gray");
  const rowAt = about.indexOf("<MoreFromYouneekRow />");
  const privacyAt = about.indexOf('label="Privacy"');
  assert.ok(versionAt !== -1 && rowAt > versionAt && privacyAt > rowAt);
  assert.match(about, /Included with the app/);
  assert.doesNotMatch(about, /utm_|youneek\.xyz\?|analytics/);

  const allowed = new Set([
    "src/components/settings/MoreFromYouneekRow.jsx",
    "src/components/settings/MoreFromYouneekRow.test.js",
  ]);
  const mentions = sourceFiles(root)
    .filter((path) => readFileSync(path, "utf8").includes("youneek.xyz"))
    .map((path) => relative(root, path));
  assert.deepEqual(mentions.sort(), [...allowed].sort());

  assert.match(read("src/pages/More.jsx"), /No ads\. No upsell\./);
  assert.doesNotMatch(read("src/pages/Radar.jsx"), /More from YouNeeK|youneek\.xyz/);
});
