import assert from "node:assert/strict";
import test from "node:test";
import {
  addShelterContact,
  buildEmergencyBody,
  MAX_SHELTER_CONTACTS,
  buildImSafeBody,
  buildGroupSmsUrl,
  buildSafetyMessage,
  buildSmsUrl,
  deviceCanComposeSms,
  loadSafetyMessages,
  normalizeUsPhone,
  safetyMessageExplanation,
  safetyGpsLine,
  safetyMapLink,
  safetyPlaceName,
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

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const DALLAS = { latitude: 32.7767, longitude: -96.797 };

test("I'm Safe text is readable, names the alert and town, and has one Apple Maps link on iPhone", () => {
  const body = buildSafetyMessage({ kind: "safe", alertName: "Tornado Warning", place: "Dallas, TX", coords: DALLAS, userAgent: IPHONE });
  assert.equal(
    body,
    "I'm safe. Tornado Warning is in effect near Dallas, TX. Here's where I am: https://maps.apple.com/?ll=32.77670,-96.79700&q=32.77670,-96.79700\n(GPS 32.7767, -96.7970)"
  );
  assert.equal(body.match(/https?:\/\//g).length, 1);
});

test("I Need Help text asks for a call and has one Google Maps link on Android", () => {
  const body = buildSafetyMessage({ kind: "emergency", alertName: "Tornado Warning", place: "Dallas, TX", coords: DALLAS, userAgent: ANDROID });
  assert.equal(
    body,
    "I need help. Tornado Warning near Dallas, TX. I'm here: https://maps.google.com/?q=32.77670,-96.79700. Please call me or send help.\n(GPS 32.7767, -96.7970)"
  );
  assert.equal(body.match(/https?:\/\//g).length, 1);
  assert.equal(body.includes("maps.apple.com"), false);
});

test("no town name falls back cleanly", () => {
  assert.equal(
    buildSafetyMessage({ kind: "safe", alertName: "Severe Thunderstorm Warning", coords: DALLAS, userAgent: ANDROID }),
    "I'm safe. Severe Thunderstorm Warning is in effect. Here's where I am: https://maps.google.com/?q=32.77670,-96.79700\n(GPS 32.7767, -96.7970)"
  );
  assert.equal(
    buildEmergencyBody({ alertName: "Tornado Warning", coords: DALLAS, userAgent: ANDROID }).split("\n")[0],
    "I need help. Tornado Warning in effect. I'm here: https://maps.google.com/?q=32.77670,-96.79700. Please call me or send help."
  );
});

test("location off still builds a text, with no link and no GPS line", () => {
  const safe = buildImSafeBody({ alertName: "Tornado Warning", place: "Dallas, TX", coords: null, userAgent: IPHONE });
  assert.equal(safe, "I'm safe. Tornado Warning is in effect near Dallas, TX. My location is off, so I couldn't share a map link.");
  const help = buildEmergencyBody({ alertName: "Tornado Warning", coords: { latitude: "x" }, userAgent: IPHONE });
  assert.equal(help, "I need help. Tornado Warning in effect. My location is off, so I couldn't share a map link. Please call me or send help.");
  assert.equal(/GPS|https?:/.test(help), false);
});

test("map link and GPS line helpers", () => {
  assert.equal(safetyMapLink(DALLAS, IPHONE), "https://maps.apple.com/?ll=32.77670,-96.79700&q=32.77670,-96.79700");
  assert.equal(safetyMapLink(DALLAS, ANDROID), "https://maps.google.com/?q=32.77670,-96.79700");
  assert.equal(safetyMapLink(null, ANDROID), "");
  assert.equal(safetyGpsLine(DALLAS), "(GPS 32.7767, -96.7970)");
  assert.equal(safetyPlaceName({ city: "Dallas", state: "TX" }), "Dallas, TX");
  assert.equal(safetyPlaceName({ city: "Current", state: "" }), "");
  assert.equal(safetyPlaceName(null), "");
});

test("the prefilled sms body round-trips exactly for iPhone (&body=) and Android (?body=)", () => {
  const body = buildSafetyMessage({ kind: "emergency", alertName: "Tornado Warning", place: "Dallas, TX", coords: DALLAS, userAgent: IPHONE });
  const ios = buildGroupSmsUrl(["+15555550100", "+15555550101"], body, IPHONE);
  assert.match(ios, /^sms:\+15555550100,\+15555550101&body=/);
  assert.equal(decodeURIComponent(ios.split("&body=")[1]), body);
  const android = buildGroupSmsUrl(["+15555550100"], body, ANDROID);
  assert.match(android, /^sms:\+15555550100\?body=/);
  assert.equal(decodeURIComponent(android.split("?body=")[1]), body);
});

test("sms link keeps the phone and encodes the message", () => {
  const url = buildSmsUrl("+15555550100", "EMERGENCY — help");
  assert.match(url, /^sms:\+15555550100[?&]body=/);
  assert.match(decodeURIComponent(url), /EMERGENCY — help/);
});

test("iPad and Mac can't compose sms; iPhone can", () => {
  assert.equal(deviceCanComposeSms({ userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 5 }), true);
  assert.equal(deviceCanComposeSms({ userAgent: "iPad", platform: "iPad", maxTouchPoints: 5 }), false);
  assert.equal(deviceCanComposeSms({ userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", maxTouchPoints: 5 }), false);
  assert.match(safetyMessageExplanation(), /I'm Safe and I Need Help/);
  assert.match(safetyMessageExplanation(), /tap Send/);
  assert.match(safetyMessageExplanation(), /does not resend/);
});

test("Android keeps one sms draft with a question-mark body", () => {
  const url = buildGroupSmsUrl(
    ["+15555550100", "+15555550101"],
    "I'm safe.",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
  );
  assert.match(url, /^sms:\+15555550100,\+15555550101\?body=/);
  assert.equal(url.includes("&body="), false);
  assert.match(decodeURIComponent(url), /I'm safe\./);
  assert.equal(
    deviceCanComposeSms({
      userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8)",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
    }),
    true
  );
});

test("duplicate shelter numbers are texted once", () => {
  assert.deepEqual(
    uniqueContactPhones([{ phone: "+15555550100" }, { phone: "+15555550100" }, { phone: "" }, {}]),
    ["+15555550100"]
  );
});

test("saved custom wording still loads (kept for older installs)", () => {
  const store = memoryStorage();
  saveSafetyMessages({ emergency: "HELP", safe: "OK" }, store);
  assert.equal(loadSafetyMessages(store).safe, "OK");
});

test("a new safety contact is stored for this device and the legacy phone list", () => {
  const store = memoryStorage();
  assert.equal(normalizeUsPhone("(555) 555-0100"), "+15555550100");
  const saved = addShelterContact({ name: "Alex", phone: "5555550100", id: "1" }, store);
  assert.equal(saved[0].phone, "+15555550100");
  assert.deepEqual(JSON.parse(store.getItem("shelterContacts")), ["+15555550100"]);
  assert.throws(() => addShelterContact({ name: "Alex", phone: "12" }, store), /10-digit/);
});

test("shelter contacts stop at five people", () => {
  const store = memoryStorage();
  for (let index = 0; index < MAX_SHELTER_CONTACTS; index += 1) {
    addShelterContact({ name: `Person ${index}`, phone: `555555010${index}`, id: String(index) }, store);
  }
  assert.equal(JSON.parse(store.getItem("shelterContacts")).length, 5);
  assert.throws(() => addShelterContact({ name: "Extra", phone: "5555550199", id: "extra" }, store), /Max 5/);
});
