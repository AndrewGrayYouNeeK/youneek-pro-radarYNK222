import assert from "node:assert/strict";
import test from "node:test";
import { allowedCorsOrigin, applyCors, corsHeaders } from "./cors.js";

function requestFrom(origin) {
  return new Request("https://youneek-pro-radarynk222.youneekartifacts.workers.dev/api/weather", {
    headers: origin ? { Origin: origin } : {},
  });
}

test("only the Capacitor and Ionic local origins get CORS", () => {
  assert.equal(allowedCorsOrigin(requestFrom("capacitor://localhost")), "capacitor://localhost");
  assert.equal(allowedCorsOrigin(requestFrom("ionic://localhost")), "ionic://localhost");
  assert.equal(corsHeaders(requestFrom("capacitor://localhost"))["Access-Control-Allow-Origin"], "capacitor://localhost");
  assert.equal(corsHeaders(requestFrom("https://evil.example"))["Access-Control-Allow-Origin"], undefined);
  assert.equal(corsHeaders(requestFrom(""))["Access-Control-Allow-Origin"], undefined);
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
});
