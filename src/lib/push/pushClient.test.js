import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  REREGISTER_MS,
  coarseCell,
  localNotificationId,
  localWarningNotification,
  needsRegistration,
  newLocalWarnings,
  normalizeNotifyPermission,
  rememberNotified,
  serverPushActive,
} from "./pushClient.js";

const NOW = Date.parse("2026-05-20T21:00:00Z");

test("the phone sends a ~11 km cell, never precise coordinates", () => {
  assert.deepEqual(coarseCell(35.23456, -97.44491), { lat: 35.2, lon: -97.4 });
  assert.equal(coarseCell(null, 1), null);
  const source = readFileSync(new URL("../native/pushAlerts.js", import.meta.url), "utf8");
  assert.match(source, /lat: cell\.lat, lon: cell\.lon/);
});

test("re-registers on new token, new cell, or after 6 hours", () => {
  const cell = { lat: 35.2, lon: -97.4 };
  const previous = { token: "t", cell, at: NOW, ok: true };
  assert.equal(needsRegistration(null, { token: "t", cell, now: NOW }), true);
  assert.equal(needsRegistration(previous, { token: "t", cell, now: NOW + 1000 }), false);
  assert.equal(needsRegistration(previous, { token: "t2", cell, now: NOW + 1000 }), true);
  assert.equal(needsRegistration(previous, { token: "t", cell: { lat: 35.3, lon: -97.4 }, now: NOW + 1000 }), true);
  assert.equal(needsRegistration(previous, { token: "t", cell, now: NOW + REREGISTER_MS + 1 }), true);
  assert.equal(needsRegistration(previous, { token: "", cell, now: NOW }), false);
  assert.equal(serverPushActive(previous, NOW + 1000), true);
  assert.equal(serverPushActive({ ...previous, ok: false }, NOW), false);
});

test("local fallback notifies each new warning once", () => {
  const alerts = [
    { id: "a", name: "Tornado Warning", expires: "2026-05-20T22:00:00Z" },
    { id: "b", name: "Tornado Watch", expires: "2026-05-20T22:00:00Z" },
    { id: "c", name: "Flash Flood Warning", expires: "2026-05-20T20:00:00Z" },
    { id: "d", name: "Severe Thunderstorm Warning" },
  ];
  const fresh = newLocalWarnings(alerts, [], NOW);
  assert.deepEqual(fresh.map((alert) => alert.id), ["a", "d"]);
  const seen = rememberNotified([], fresh.map((alert) => alert.id));
  assert.deepEqual(newLocalWarnings(alerts, seen, NOW), []);
  const note = localWarningNotification(alerts[0]);
  assert.equal(note.title, "Tornado Warning");
  assert.equal(note.channelId, "severe-alerts");
  assert.equal(note.extra.route, "/Radar");
  assert.ok(Number.isInteger(localNotificationId("urn:oid:x")) && localNotificationId("urn:oid:x") > 0);
  assert.equal(localNotificationId("same"), localNotificationId("same"));
});

test("permission states normalize from Capacitor values", () => {
  assert.equal(normalizeNotifyPermission("prompt-with-rationale"), "prompt");
  assert.equal(normalizeNotifyPermission("granted"), "granted");
  assert.equal(normalizeNotifyPermission("denied"), "denied");
  assert.equal(normalizeNotifyPermission(undefined), "unknown");
});

test("notification permission is asked after contacts and location, never at launch", () => {
  const modal = readFileSync(new URL("../../components/radar/OnboardingModal.jsx", import.meta.url), "utf8");
  const order = modal.match(/const STEPS = (\[.*\]);/)[1];
  assert.deepEqual(JSON.parse(order), ["contacts", "location", "alerts", "radar"]);
  const main = readFileSync(new URL("../../main.jsx", import.meta.url), "utf8");
  const boot = readFileSync(new URL("../native/boot.js", import.meta.url), "utf8");
  assert.doesNotMatch(main + boot, /requestPermissions|requestNotifyPermission/);
  const live = readFileSync(new URL("../../components/notifications/LiveAlerts.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(live, /requestNotifyPermission|requestPermissions/, "background sync never prompts");
});

test("native config: Android asks POST_NOTIFICATIONS and drops exact alarms; iOS forwards the APNs token", () => {
  const manifest = readFileSync(new URL("../../../android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8");
  assert.match(manifest, /android\.permission\.POST_NOTIFICATIONS/);
  assert.match(manifest, /SCHEDULE_EXACT_ALARM" tools:node="remove"/);
  const delegate = readFileSync(new URL("../../../ios/App/App/AppDelegate.swift", import.meta.url), "utf8");
  assert.match(delegate, /capacitorDidRegisterForRemoteNotifications/);
  const gradle = readFileSync(new URL("../../../android/app/build.gradle", import.meta.url), "utf8");
  assert.match(gradle, /file\('google-services\.json'\)/);
});
