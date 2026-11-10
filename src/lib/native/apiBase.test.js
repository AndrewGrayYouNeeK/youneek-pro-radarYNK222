import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_NATIVE_API_ORIGIN, resolveApiOrigin, toApiUrl } from "./apiBase.js";

test("the website keeps same-origin /api calls", () => {
  assert.equal(resolveApiOrigin({ native: false, protocol: "https:" }), "");
  assert.equal(toApiUrl("/api/weather?lat=1", ""), "/api/weather?lat=1");
});

test("the native app calls the live Worker unless an origin is configured", () => {
  assert.equal(resolveApiOrigin({ native: true }), DEFAULT_NATIVE_API_ORIGIN);
  assert.equal(resolveApiOrigin({ protocol: "capacitor:" }), DEFAULT_NATIVE_API_ORIGIN);
  assert.equal(resolveApiOrigin({ protocol: "ionic:" }), DEFAULT_NATIVE_API_ORIGIN);
  assert.equal(
    resolveApiOrigin({ native: true, configured: "https://example.test/radar/" }),
    "https://example.test/radar"
  );
  assert.equal(
    toApiUrl("/api/weather?lat=1&lon=2", DEFAULT_NATIVE_API_ORIGIN),
    `${DEFAULT_NATIVE_API_ORIGIN}/api/weather?lat=1&lon=2`
  );
  assert.equal(toApiUrl("https://api.rainviewer.com/public/weather-maps.json", DEFAULT_NATIVE_API_ORIGIN), "https://api.rainviewer.com/public/weather-maps.json");
});
