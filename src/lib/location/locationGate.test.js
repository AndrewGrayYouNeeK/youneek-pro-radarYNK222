import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { installLocationGate, isLocationGateHeld, releaseLocationGate } from "./locationGate.js";

function fakeGeo() {
  const log = [];
  let id = 100;
  return {
    log,
    getCurrentPosition: (ok) => { log.push("get"); ok?.({ coords: { latitude: 1, longitude: 2 } }); },
    watchPosition: () => { log.push("watch"); id += 1; return id; },
    clearWatch: (real) => { log.push(`clear:${real}`); },
  };
}

test("location requests wait until safety contacts setup releases them", () => {
  const geo = fakeGeo();
  installLocationGate(geo, { hold: true });
  let fixes = 0;
  geo.getCurrentPosition(() => { fixes += 1; });
  const watchId = geo.watchPosition(() => {});
  assert.deepEqual(geo.log, [], "nothing reaches the OS while held");
  assert.equal(isLocationGateHeld(), true);
  releaseLocationGate();
  assert.deepEqual(geo.log, ["get", "watch"]);
  assert.equal(fixes, 1);
  geo.clearWatch(watchId);
  assert.deepEqual(geo.log, ["get", "watch", "clear:101"]);
});

test("a watch cleared while held never starts", () => {
  const geo = fakeGeo();
  installLocationGate(geo, { hold: true });
  const watchId = geo.watchPosition(() => {});
  geo.clearWatch(watchId);
  releaseLocationGate();
  assert.deepEqual(geo.log, []);
});

test("returning users are not held", () => {
  const geo = fakeGeo();
  installLocationGate(geo, { hold: false });
  geo.getCurrentPosition(() => {});
  assert.deepEqual(geo.log, ["get"]);
});

test("safety contacts are the first onboarding screen and release location after it", () => {
  const modal = readFileSync(new URL("../../components/radar/OnboardingModal.jsx", import.meta.url), "utf8");
  assert.match(modal, /const STEPS = \["contacts", "location", "alerts", "radar"\]/);
  assert.match(modal, /releaseLocationGate\(\)/);
  assert.match(modal, /Skip for now/);
  const main = readFileSync(new URL("../../main.jsx", import.meta.url), "utf8");
  assert.match(main, /installLocationGate\(/);
  assert.ok(main.indexOf("installLocationGate(") < main.indexOf(".render("), "gate is installed before the app renders");
});
