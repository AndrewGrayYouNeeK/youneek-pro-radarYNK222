import assert from "node:assert/strict";
import test from "node:test";
import {
  addShelterContact,
  buildEmergencyBody,
  buildImSafeBody,
  buildGroupSmsUrl,
  buildSmsUrl,
  deviceCanComposeSms,
  formatSafetyLocationLine,
  loadSafetyMessages,
  normalizeUsPhone,
  safetyMessageExplanation,
  saveSafetyMessages,
  uniqueContactPhones,
} from "./sms.js";

function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
  };
}

test("Help Me draft says to take shelter and includes the map link", () => {
  const body = buildEmergencyBody({
    locationLine: "My location: https://maps.google.com/?q=37.7,-122.4",
  });
  assert.match(body, /EMERGENCY — I need help/);
  assert.match(body, /taking shelter/);
  assert.match(body, /maps\.google\.com\/\?q=37\.7,-122\.4/);
  assert.match(body, /YouNeeK Pro Radar/);
});

test("I’m Sheltering draft says the user is sheltering and safe and keeps the map link", () => {
  const body = buildImSafeBody({
    locationLine: "My location: 37.70000, -122.41940\nhttps://maps.google.com/?q=37.70000,-122.41940",
  });
  assert.match(body, /I’M SHELTERING/);
  assert.match(body, /sheltering and I am safe/);
  assert.match(body, /maps\.google\.com/);
});

test("sms link keeps the phone and encodes the message", () => {
  const url = buildSmsUrl("+15555550100", "EMERGENCY — help");
  assert.match(url, /^sms:\+15555550100[?&]body=/);
  assert.match(decodeURIComponent(url), /EMERGENCY — help/);
});

test("iOS opens one composer for every saved contact and the draft includes coordinates", () => {
  const line = formatSafetyLocationLine({ latitude: 37.7, longitude: -122.4194 });
  assert.match(line, /37\.70000, -122\.41940/);
  assert.match(line, /maps\.apple\.com/);
  assert.match(line, /maps\.google\.com\/\?q=37\.70000,-122\.41940/);
  const url = buildGroupSmsUrl(["+15555550100", "+15555550101"], `Help\n${line}`, "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");
  assert.match(url, /^sms:\+15555550100,\+15555550101&body=/);
  assert.match(decodeURIComponent(url), /37\.70000, -122\.41940/);
  assert.equal(deviceCanComposeSms({ userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 5 }), true);
  assert.equal(deviceCanComposeSms({ userAgent: "iPad", platform: "iPad", maxTouchPoints: 5 }), false);
  assert.equal(deviceCanComposeSms({ userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", maxTouchPoints: 5 }), false);
  assert.match(safetyMessageExplanation(), /I’m Sheltering/);
  assert.match(safetyMessageExplanation(), /Google Maps/);
  assert.match(safetyMessageExplanation(), /tap Send/);
  assert.match(safetyMessageExplanation(), /does not resend/);
});

test("duplicate shelter numbers are texted once", () => {
  assert.deepEqual(
    uniqueContactPhones([{ phone: "+15555550100" }, { phone: "+15555550100" }, { phone: "" }, {}]),
    ["+15555550100"]
  );
});

test("edited safety messages are saved and used in the drafts", () => {
  const store = memoryStorage();
  saveSafetyMessages(
    {
      emergency: "HELP — meet me at the shelter.",
      safe: "I am safe and heading home.",
    },
    store
  );
  assert.equal(loadSafetyMessages(store).safe, "I am safe and heading home.");
  const emergency = buildEmergencyBody({
    locationLine: "My location: https://maps.google.com/?q=37.7,-122.4",
    storage: store,
  });
  const safe = buildImSafeBody({
    locationLine: "My location: https://maps.google.com/?q=37.7,-122.4",
    storage: store,
  });
  assert.match(emergency, /HELP — meet me at the shelter/);
  assert.match(safe, /I am safe and heading home/);
  assert.match(emergency, /maps\.google\.com/);
});

test("a new safety contact is stored for this device and the legacy phone list", () => {
  const store = memoryStorage();
  assert.equal(normalizeUsPhone("(555) 555-0100"), "+15555550100");
  const saved = addShelterContact({ name: "Alex", phone: "5555550100", id: "1" }, store);
  assert.equal(saved[0].phone, "+15555550100");
  assert.deepEqual(JSON.parse(store.getItem("shelterContacts")), ["+15555550100"]);
  assert.throws(() => addShelterContact({ name: "Alex", phone: "12" }, store), /10-digit/);
});
