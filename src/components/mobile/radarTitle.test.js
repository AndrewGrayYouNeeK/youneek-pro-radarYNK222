import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const TITLE = "YouNeeK ProRadar";

test("the /Radar page header and browser tab say YouNeeK ProRadar, not just Radar", () => {
  const page = readFileSync(new URL("../../pages/Radar.jsx", import.meta.url), "utf8");
  const header = readFileSync(new URL("./AppHeader.jsx", import.meta.url), "utf8");
  assert.match(page, /<AppHeader title="YouNeeK ProRadar" \/>/);
  assert.match(page, /document\.title = "YouNeeK ProRadar"/);
  assert.match(header, /"\/Radar": "YouNeeK ProRadar"/);
  assert.doesNotMatch(page, /<AppHeader title="Radar" \/>/);
  assert.equal(TITLE, "YouNeeK ProRadar");
});
