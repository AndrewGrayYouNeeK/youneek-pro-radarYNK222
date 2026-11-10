import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function field(name) {
  return readFileSync(join(root, "fastlane/metadata/en-US", name), "utf8").replace(/\n$/, "");
}

test("App Store metadata stays inside Apple's character limits", () => {
  const name = field("name.txt");
  const subtitle = field("subtitle.txt");
  const promo = field("promotional_text.txt");
  const keywords = field("keywords.txt");
  assert.equal(name, "YouNeeK Pro Radar");
  assert.equal(subtitle, "Tactical NEXRAD & Alerts");
  assert.ok(name.length <= 30, `name ${name.length}`);
  assert.ok(subtitle.length <= 30, `subtitle ${subtitle.length}`);
  assert.ok(promo.length <= 170, `promo ${promo.length}`);
  assert.ok(keywords.length <= 100, `keywords ${keywords.length}`);
  assert.match(field("description.txt"), /I’M SHELTERING/);
  assert.match(field("release_notes.txt"), /I’m Sheltering/);
  assert.equal(field("primary_category.txt"), "WEATHER");
  assert.equal(field("secondary_category.txt"), "NAVIGATION");
  assert.match(readFileSync(join(root, "public/sw.js"), "utf8"), /networkFirst/);
  assert.match(readFileSync(join(root, "public/sw.js"), "utf8"), /request\.mode === "navigate"/);
});
