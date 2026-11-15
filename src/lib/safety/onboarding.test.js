import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addShelterContact, loadShelterContacts } from "./sms.js";
import {
  ONBOARDED_KEY,
  SAFETY_SKIPPED_KEY,
  finishSafetyOnboarding,
  shouldRemindSafetyContacts,
  shouldShowSafetyOnboarding,
} from "./onboarding.js";

function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    removeItem(key) {
      delete data[key];
    },
  };
}

test("safety onboarding shows on the first run only", () => {
  const store = memoryStorage();
  assert.equal(shouldShowSafetyOnboarding(store), true);
  finishSafetyOnboarding(store, { skipped: false });
  assert.equal(store.getItem(ONBOARDED_KEY), "true");
  assert.equal(shouldShowSafetyOnboarding(store), false);
});

test("skip finishes onboarding and reminds in settings when no contacts were saved", () => {
  const store = memoryStorage();
  const result = finishSafetyOnboarding(store, { skipped: true });
  assert.equal(result.remind, true);
  assert.equal(store.getItem(SAFETY_SKIPPED_KEY), "1");
  assert.equal(shouldShowSafetyOnboarding(store), false);
  assert.equal(shouldRemindSafetyContacts(store), true);
});

test("contacts added during onboarding are the contacts Settings reads", () => {
  const store = memoryStorage();
  addShelterContact({ name: "Alex", phone: "5555550100", id: "1" }, store);
  addShelterContact({ name: "Jordan", phone: "(555) 555-0101", id: "2" }, store);
  finishSafetyOnboarding(store, { skipped: false });

  const saved = loadShelterContacts(store);
  assert.deepEqual(
    saved.map((contact) => contact.name),
    ["Alex", "Jordan"]
  );
  assert.match(store.getItem("shelterContacts_v2"), /Alex/);
  assert.match(store.getItem("shelterContacts"), /\+15555550100/);
  assert.equal(shouldRemindSafetyContacts(store), false);
  assert.equal(store.getItem(SAFETY_SKIPPED_KEY), null);
});

test("skip keeps contacts that were already saved and does not remind", () => {
  const store = memoryStorage();
  addShelterContact({ name: "Alex", phone: "5555550100", id: "1" }, store);
  finishSafetyOnboarding(store, { skipped: true });
  assert.equal(loadShelterContacts(store)[0].name, "Alex");
  assert.equal(shouldRemindSafetyContacts(store), false);
  assert.equal(shouldShowSafetyOnboarding(store), false);
});

test("the empty-contact reminder is mounted from Settings and not the radar map", () => {
  const settings = readFileSync(new URL("../../pages/Settings.jsx", import.meta.url), "utf8");
  const radar = readFileSync(new URL("../../components/radar/RadarDisplay.jsx", import.meta.url), "utf8");
  const home = readFileSync(new URL("../../components/home/WeatherHome.jsx", import.meta.url), "utf8");
  assert.match(settings, /SafetyReminderCard/);
  assert.doesNotMatch(radar, /SafetyReminderCard/);
  assert.doesNotMatch(home, /SafetyReminderCard/);
});
