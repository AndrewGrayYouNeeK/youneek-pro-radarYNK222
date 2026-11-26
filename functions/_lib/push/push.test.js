import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { coarseCell, zoneCode } from "./coarse.js";
import { runPushCron, maxSends } from "./cron.js";
import { deviceMatchesAlert, pushableAlerts } from "./match.js";
import { ANDROID_CHANNEL_ID, alertNotification, buildApnsPayload, buildFcmMessage } from "./payload.js";
import { handlePushRegister, handlePushUnregister } from "./register.js";
import { pushConfig, resetSenderCaches } from "./senders.js";
import { DEVICE_PREFIX, SENT_KEY, listDevices, saveDevice, validToken } from "./store.js";
import worker from "../../../worker/index.js";

function fakeKv() {
  const map = new Map();
  return {
    map,
    async get(key) {
      return map.get(key)?.value ?? null;
    },
    async put(key, value, options = {}) {
      map.set(key, { value, metadata: options.metadata, ttl: options.expirationTtl });
    },
    async delete(key) {
      map.delete(key);
    },
    async list({ prefix = "" } = {}) {
      const keys = [...map.entries()]
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, entry]) => ({ name, metadata: entry.metadata }));
      return { keys, list_complete: true };
    },
  };
}

const IOS_TOKEN = "a".repeat(64);
const ANDROID_TOKEN = `fcm:${"B".repeat(150)}`;
const NOW = Date.parse("2026-05-20T21:00:00Z");

function warning(overrides = {}) {
  return {
    id: "https://api.weather.gov/alerts/urn:oid:tor-1",
    properties: {
      id: "urn:oid:tor-1",
      event: "Tornado Warning",
      status: "Actual",
      messageType: "Alert",
      areaDesc: "Cleveland, OK; McClain, OK",
      expires: "2026-05-20T22:00:00Z",
      geocode: { UGC: ["OKC027", "OKC087"] },
      affectedZones: ["https://api.weather.gov/zones/county/OKC027"],
      ...overrides.properties,
    },
    geometry: overrides.geometry === undefined
      ? { type: "Polygon", coordinates: [[[-97.6, 35.1], [-97.2, 35.1], [-97.2, 35.4], [-97.6, 35.4], [-97.6, 35.1]]] }
      : overrides.geometry,
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function pointsFetch(calls = []) {
  return async (url) => {
    calls.push(String(url));
    return jsonResponse({
      properties: {
        forecastZone: "https://api.weather.gov/zones/forecast/OKZ025",
        county: "https://api.weather.gov/zones/county/OKC027",
        fireWeatherZone: "https://api.weather.gov/zones/fire/OKZ025",
      },
    });
  };
}

function registerRequest(body) {
  return new Request("https://x.test/api/push/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("coarse cells round to 0.1° and zone codes parse from NWS URLs", () => {
  assert.deepEqual(coarseCell(35.23456, -97.4449), { lat: 35.2, lon: -97.4 });
  assert.equal(coarseCell("x", 1), null);
  assert.equal(zoneCode("https://api.weather.gov/zones/county/OKC027"), "OKC027");
  assert.equal(zoneCode("nope"), null);
  assert.equal(coarseCell(null, -97), null);
});

test("registration stores only token, zones and the rounded cell", async () => {
  const kv = fakeKv();
  const calls = [];
  const response = await handlePushRegister(
    registerRequest({ platform: "ios", token: IOS_TOKEN, lat: 35.23456, lon: -97.44491 }),
    { PUSH_KV: kv },
    { fetchImpl: pointsFetch(calls) }
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.cell, { lat: 35.2, lon: -97.4 });
  assert.ok(calls[0].endsWith("/points/35.2,-97.4"), "NWS gets the rounded point only");
  assert.equal(kv.map.size, 1);
  const [key, entry] = [...kv.map.entries()][0];
  assert.ok(key.startsWith(DEVICE_PREFIX));
  assert.ok(!key.includes(IOS_TOKEN), "key is a hash, not the token");
  assert.equal(entry.ttl, 30 * 24 * 60 * 60);
  assert.ok(!JSON.stringify(entry).includes("35.23"), "precise latitude is never stored");
  const devices = await listDevices(kv);
  assert.deepEqual(devices[0].zones.sort(), ["OKC027", "OKZ025"]);
  assert.equal(devices[0].platform, "ios");
  assert.ok(JSON.stringify(entry.metadata).length < 1024, "fits KV metadata limit");
});

test("registration rejects bad tokens and works as a 503 no-op without KV", async () => {
  const kv = fakeKv();
  const bad = await handlePushRegister(registerRequest({ platform: "ios", token: "xyz", lat: 1, lon: 1 }), { PUSH_KV: kv }, { fetchImpl: pointsFetch() });
  assert.equal(bad.status, 400);
  const noKv = await handlePushRegister(registerRequest({ platform: "ios", token: IOS_TOKEN, lat: 1, lon: 1 }), {});
  assert.equal(noKv.status, 503);
  assert.equal(validToken("android", ANDROID_TOKEN), true);
  assert.equal(validToken("android", "short"), false);
  assert.equal(validToken("web", IOS_TOKEN), false);
});

test("unregister removes the device", async () => {
  const kv = fakeKv();
  await saveDevice(kv, { platform: "ios", token: IOS_TOKEN, zones: ["OKC027"], cell: { lat: 35.2, lon: -97.4 } });
  const response = await handlePushUnregister(
    new Request("https://x.test/api/push/unregister", { method: "POST", body: JSON.stringify({ token: IOS_TOKEN }) }),
    { PUSH_KV: kv }
  );
  assert.equal(response.status, 200);
  assert.equal(kv.map.size, 0);
});

test("only new, active Tornado / Severe Thunderstorm / Flash Flood Warnings are pushable", () => {
  const list = pushableAlerts(
    [
      warning(),
      warning({ properties: { id: "u1", messageType: "Update" } }),
      warning({ properties: { id: "w1", event: "Tornado Watch" } }),
      warning({ properties: { id: "x1", expires: "2026-05-20T20:00:00Z" } }),
      warning({ properties: { id: "t1", status: "Test" } }),
      warning({ properties: { id: "f1", event: "Flash Flood Warning" } }),
    ],
    NOW
  );
  assert.deepEqual(list.map((f) => f.properties.id), ["urn:oid:tor-1", "f1"]);
});

test("zone matching needs a county/zone hit and a cell in or near the polygon", () => {
  const inside = { zones: ["OKC027"], cell: { lat: 35.2, lon: -97.4 } };
  const otherCounty = { zones: ["TXC113"], cell: { lat: 35.2, lon: -97.4 } };
  const sameCountyFar = { zones: ["OKC027"], cell: { lat: 34.6, lon: -97.4 } };
  const edge = { zones: ["OKC027"], cell: { lat: 35.5, lon: -97.4 } };
  assert.equal(deviceMatchesAlert(inside, warning()), true);
  assert.equal(deviceMatchesAlert(otherCounty, warning()), false);
  assert.equal(deviceMatchesAlert(sameCountyFar, warning()), false);
  assert.equal(deviceMatchesAlert(edge, warning()), true, "0.1 outside the polygon still counts");
  const noPolygon = warning({ geometry: null });
  assert.equal(deviceMatchesAlert(sameCountyFar, noPolygon), true, "county-wide warning uses zones");
  assert.equal(deviceMatchesAlert(otherCounty, noPolygon), false);
});

test("payloads: APNs time-sensitive alert and FCM high-priority on the severe channel", () => {
  const note = alertNotification(warning());
  assert.equal(note.title, "Tornado Warning");
  assert.match(note.body, /Take shelter now/);
  const apns = buildApnsPayload(warning());
  assert.equal(apns.aps["interruption-level"], "time-sensitive");
  assert.equal(apns.aps.sound, "default");
  assert.equal(apns.aps.alert.title, "Tornado Warning");
  assert.equal(apns.route, "/Radar");
  const fcm = buildFcmMessage(ANDROID_TOKEN, warning());
  assert.equal(fcm.message.token, ANDROID_TOKEN);
  assert.equal(fcm.message.android.priority, "HIGH");
  assert.equal(fcm.message.android.notification.channel_id, ANDROID_CHANNEL_ID);
  assert.equal(fcm.message.data.route, "/Radar");
  assert.ok(Object.values(fcm.message.data).every((value) => typeof value === "string"), "FCM data values are strings");
});

test("missing secrets: cron is a no-op and makes no network calls", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return jsonResponse({});
  };
  const kv = fakeKv();
  assert.equal((await runPushCron({}, { fetchImpl })).status, "no-kv");
  const result = await runPushCron({ PUSH_KV: kv }, { fetchImpl });
  assert.equal(result.status, "no-secrets");
  assert.ok(result.missing.includes("APNS_PRIVATE_KEY"));
  assert.equal(calls, 0);
  assert.equal(kv.map.size, 0);
  assert.equal(pushConfig({ FCM_SERVICE_ACCOUNT: "{not json" }).fcm, false);
  assert.equal(pushConfig({ APNS_KEY_ID: "K", APNS_TEAM_ID: "T", APNS_BUNDLE_ID: "b" }).apns, false);
});

function secrets() {
  const ec = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const rsa = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    APNS_KEY_ID: "ABC123DEFG",
    APNS_TEAM_ID: "4NJ8T765L2",
    APNS_BUNDLE_ID: "com.base69facdfe1fbc3700e00a8387.app",
    APNS_PRIVATE_KEY: ec.privateKey.export({ type: "pkcs8", format: "pem" }),
    FCM_SERVICE_ACCOUNT: JSON.stringify({
      project_id: "ynk-test",
      client_email: "push@ynk-test.iam.gserviceaccount.com",
      private_key: rsa.privateKey.export({ type: "pkcs8", format: "pem" }),
    }),
  };
}

function cronFetch(features, log, { apnsStatus = 200 } = {}) {
  return async (url, init = {}) => {
    const href = String(url);
    log.push({ href, init });
    if (href.startsWith("https://api.weather.gov/alerts/active")) return jsonResponse({ features });
    if (href === "https://oauth2.googleapis.com/token") return jsonResponse({ access_token: "ya29.fake", expires_in: 3600 });
    if (href.startsWith("https://api.push.apple.com/")) {
      return apnsStatus === 200 ? new Response("", { status: 200 }) : jsonResponse({ reason: "Unregistered" }, apnsStatus);
    }
    if (href.includes("fcm.googleapis.com")) return jsonResponse({ name: "projects/ynk-test/messages/1" });
    throw new Error(`unexpected fetch ${href}`);
  };
}

test("cron sends each warning once per matching device (dedupe by alert id)", async () => {
  resetSenderCaches();
  const kv = fakeKv();
  const env = { PUSH_KV: kv, ...secrets() };
  await saveDevice(kv, { platform: "ios", token: IOS_TOKEN, zones: ["OKC027"], cell: { lat: 35.2, lon: -97.4 } });
  await saveDevice(kv, { platform: "android", token: ANDROID_TOKEN, zones: ["OKC027"], cell: { lat: 35.3, lon: -97.3 } });
  await saveDevice(kv, { platform: "android", token: `far:${"C".repeat(150)}`, zones: ["TXC113"], cell: { lat: 30.1, lon: -97.7 } });
  const log = [];
  const first = await runPushCron(env, { fetchImpl: cronFetch([warning()], log), now: NOW });
  assert.equal(first.status, "ran");
  assert.equal(first.sent, 2);
  const apns = log.find((call) => call.href.startsWith("https://api.push.apple.com/3/device/"));
  assert.ok(apns.href.endsWith(IOS_TOKEN));
  assert.equal(apns.init.headers["apns-topic"], env.APNS_BUNDLE_ID);
  assert.match(apns.init.headers.authorization, /^bearer ey/);
  const fcm = log.find((call) => call.href.includes("/v1/projects/ynk-test/messages:send"));
  assert.equal(JSON.parse(fcm.init.body).message.token, ANDROID_TOKEN);
  assert.ok(JSON.parse(await kv.get(SENT_KEY)).includes("urn:oid:tor-1"));

  const again = [];
  const second = await runPushCron(env, { fetchImpl: cronFetch([warning()], again), now: NOW + 120000 });
  assert.equal(second.status, "nothing-new");
  assert.equal(again.filter((call) => !call.href.includes("api.weather.gov")).length, 0, "no repeat sends");
});

test("cron removes dead tokens and carries over sends beyond the per-run cap", async () => {
  resetSenderCaches();
  const kv = fakeKv();
  const env = { PUSH_KV: kv, ...secrets(), PUSH_MAX_SENDS: "1" };
  await saveDevice(kv, { platform: "ios", token: IOS_TOKEN, zones: ["OKC027"], cell: { lat: 35.2, lon: -97.4 } });
  await saveDevice(kv, { platform: "ios", token: "b".repeat(64), zones: ["OKC027"], cell: { lat: 35.2, lon: -97.4 } });
  const first = await runPushCron(env, { fetchImpl: cronFetch([warning()], [], { apnsStatus: 410 }), now: NOW });
  assert.equal(first.carriedOver, 1);
  assert.equal(first.removed, 1);
  assert.equal((await listDevices(kv)).length, 1);
  assert.equal(await kv.get(SENT_KEY), null, "alert not marked done while sends remain");
  const log = [];
  const second = await runPushCron(env, { fetchImpl: cronFetch([warning()], log), now: NOW + 120000 });
  assert.equal(second.sent, 1);
  assert.equal(log.filter((call) => call.href.includes("push.apple.com")).length, 1, "only the remaining device");
  assert.ok(JSON.parse(await kv.get(SENT_KEY)).includes("urn:oid:tor-1"));
  assert.equal(maxSends({}), 40);
});

test("worker exposes push routes and a scheduled handler", async () => {
  assert.equal(typeof worker.scheduled, "function");
  const pending = [];
  await worker.scheduled({ cron: "*/2 * * * *" }, {}, { waitUntil: (promise) => pending.push(promise) });
  await Promise.all(pending);
  const response = await worker.fetch(
    new Request("https://x.test/api/push/register", { method: "POST", body: "{}", headers: { Origin: "capacitor://localhost" } }),
    {},
    { waitUntil() {} }
  );
  assert.equal(response.status, 503, "no KV binding → configured-off response, not a crash");
});
