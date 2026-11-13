import assert from "node:assert/strict";
import test from "node:test";
import { NATIVE_APP_ORIGINS, allowedCorsOrigin, applyCors, corsHeaders } from "./cors.js";

function requestFrom(origin) {
  return new Request("https://youneek-pro-radarynk222.youneekartifacts.workers.dev/api/weather", {
    headers: origin ? { Origin: origin } : {},
  });
}

test("only the Capacitor, Ionic, and Android local origins get CORS", () => {
  assert.deepEqual(NATIVE_APP_ORIGINS, ["capacitor://localhost", "ionic://localhost", "https://localhost"]);
  assert.equal(allowedCorsOrigin(requestFrom("capacitor://localhost")), "capacitor://localhost");
  assert.equal(allowedCorsOrigin(requestFrom("ionic://localhost")), "ionic://localhost");
  assert.equal(allowedCorsOrigin(requestFrom("https://localhost")), "https://localhost");
  assert.equal(corsHeaders(requestFrom("capacitor://localhost"))["Access-Control-Allow-Origin"], "capacitor://localhost");
  assert.equal(corsHeaders(requestFrom("https://localhost"))["Access-Control-Allow-Origin"], "https://localhost");
  assert.equal(corsHeaders(requestFrom("https://evil.example"))["Access-Control-Allow-Origin"], undefined);
  assert.equal(corsHeaders(requestFrom("http://localhost"))["Access-Control-Allow-Origin"], undefined);
  assert.equal(corsHeaders(requestFrom("https://localhost:8080"))["Access-Control-Allow-Origin"], undefined);
  assert.equal(corsHeaders(requestFrom("https://127.0.0.1"))["Access-Control-Allow-Origin"], undefined);
  assert.equal(corsHeaders(requestFrom("https://localhost.evil.example"))["Access-Control-Allow-Origin"], undefined);
  assert.equal(corsHeaders(requestFrom(""))["Access-Control-Allow-Origin"], undefined);
  assert.equal(NATIVE_APP_ORIGINS.includes("*"), false);
});

test("a wildcard CORS header is removed for every other origin", () => {
  const response = applyCors(
    requestFrom("https://evil.example"),
    new Response("{}", { headers: { "Access-Control-Allow-Origin": "*" } })
  );
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  const native = applyCors(
    requestFrom("ionic://localhost"),
    new Response("{}", { headers: { "Access-Control-Allow-Origin": "*" } })
  );
  assert.equal(native.headers.get("Access-Control-Allow-Origin"), "ionic://localhost");
  const android = applyCors(
    requestFrom("https://localhost"),
    new Response("{}", { headers: { "Access-Control-Allow-Origin": "*" } })
  );
  assert.equal(android.headers.get("Access-Control-Allow-Origin"), "https://localhost");
});
