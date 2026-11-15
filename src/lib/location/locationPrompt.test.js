import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCATION_OFF_TEXT,
  LOCATION_PROMPT_SNOOZE_MS,
  locationIsOff,
  locationPromptAction,
  normalizePermission,
  promptSnoozed,
  servicesOffInstructions,
  webLocationInstructions,
} from "./locationPrompt.js";

test("prompt copy names both safety buttons", () => {
  assert.equal(
    LOCATION_OFF_TEXT,
    "Location is off. Turn it on to see storms near you and use I'm Safe / I Need Help."
  );
});

test("permission strings normalize", () => {
  assert.equal(normalizePermission("granted"), "granted");
  assert.equal(normalizePermission("denied"), "denied");
  assert.equal(normalizePermission("prompt-with-rationale"), "prompt");
  assert.equal(normalizePermission(undefined), "unknown");
});

test("off when denied, never asked, or services are off; on when granted", () => {
  assert.equal(locationIsOff({ permission: "denied" }), true);
  assert.equal(locationIsOff({ permission: "prompt" }), true);
  assert.equal(locationIsOff({ permission: "granted", servicesOff: true }), true);
  assert.equal(locationIsOff({ permission: "granted" }), false);
  assert.equal(locationIsOff({ permission: "unknown", gpsStatus: "denied" }), true);
  assert.equal(locationIsOff({ permission: "unknown", gpsStatus: "ok" }), false);
});

test("native asks first, then sends people to the app's Settings", () => {
  assert.equal(locationPromptAction({ permission: "prompt", native: true }), "request");
  assert.equal(locationPromptAction({ permission: "denied", native: true }), "settings");
  assert.equal(locationPromptAction({ permission: "granted", servicesOff: true, native: true }), "settings");
});

test("web asks once, then shows browser instructions", () => {
  assert.equal(locationPromptAction({ permission: "prompt", native: false }), "request");
  assert.equal(locationPromptAction({ permission: "denied", native: false }), "instructions");
  assert.match(webLocationInstructions("iPhone"), /Website Settings/);
  assert.match(webLocationInstructions("Android"), /Permissions/);
  assert.match(servicesOffInstructions("ios"), /Location Services/);
});

test("a dismissed banner stays hidden for a day", () => {
  const now = 1_000_000_000;
  assert.equal(promptSnoozed(String(now - 1000), now), true);
  assert.equal(promptSnoozed(String(now - LOCATION_PROMPT_SNOOZE_MS - 1), now), false);
  assert.equal(promptSnoozed(null, now), false);
});
