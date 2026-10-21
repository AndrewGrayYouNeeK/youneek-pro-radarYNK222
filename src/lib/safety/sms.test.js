import assert from "node:assert/strict";
import test from "node:test";
import { buildEmergencyBody, buildImSafeBody, buildSmsUrl, uniqueContactPhones } from "./sms.js";

test("Help Me draft says to take shelter and includes the map link", () => {
  const body = buildEmergencyBody({
    locationLine: "My location: https://maps.google.com/?q=37.7,-122.4",
  });
  assert.match(body, /EMERGENCY — I need help/);
  assert.match(body, /taking shelter/);
  assert.match(body, /maps\.google\.com\/\?q=37\.7,-122\.4/);
  assert.match(body, /YouNeeK Pro Radar/);
});

test("I'm Safe draft keeps the all-clear line and the map link", () => {
  const body = buildImSafeBody({
    context: "I'M SAFE — I am OK and accounted for.",
    locationLine: "My location: https://maps.google.com/?q=37.7,-122.4",
  });
  assert.match(body, /I'M SAFE — I am OK/);
  assert.match(body, /maps\.google\.com/);
});

test("sms link keeps the phone and encodes the message", () => {
  const url = buildSmsUrl("+15555550100", "EMERGENCY — help");
  assert.match(url, /^sms:\+15555550100[?&]body=/);
  assert.match(decodeURIComponent(url), /EMERGENCY — help/);
});

test("duplicate shelter numbers are texted once", () => {
  assert.deepEqual(
    uniqueContactPhones([{ phone: "+15555550100" }, { phone: "+15555550100" }, { phone: "" }, {}]),
    ["+15555550100"]
  );
});
