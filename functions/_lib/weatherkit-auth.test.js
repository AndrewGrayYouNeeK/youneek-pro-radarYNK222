import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { probeWeatherKitAuth, sanitizeWeatherKitError, WEATHERKIT_AVAILABILITY_URL } from "./weatherkit-auth.js";

const SECRET_BODY = "THIS-IS-NOT-A-REAL-KEY-AND-MUST-NOT-LEAK";

function pem() {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  return privateKey.export({ type: "pkcs8", format: "pem" });
}

function envWith(key) {
  return {
    WEATHERKIT_TEAM_ID: "TEAMID1234",
    WEATHERKIT_KEY_ID: "KEYID12345",
    WEATHERKIT_SERVICE_ID: "com.youneek.proradar.weather",
    WEATHERKIT_PRIVATE_KEY: key,
  };
}

test("missing secrets report auth missing and do not call Apple", async () => {
  let called = false;
  const status = await probeWeatherKitAuth(
    { WEATHERKIT_TEAM_ID: "TEAMID1234" },
    {
      fetchImpl: async () => {
        called = true;
        return { ok: true, status: 200, json: async () => [] };
      },
    }
  );
  assert.equal(called, false);
  assert.equal(status.ok, false);
  assert.equal(status.auth, "missing");
  assert.deepEqual(status.missing, ["WEATHERKIT_KEY_ID", "WEATHERKIT_SERVICE_ID", "WEATHERKIT_PRIVATE_KEY"]);
  assert.equal(JSON.stringify(status).includes(SECRET_BODY), false);
});

test("a key that cannot be signed is invalid_key and does not echo the secret", async () => {
  const status = await probeWeatherKitAuth(envWith(SECRET_BODY));
  assert.equal(status.ok, false);
  assert.equal(status.auth, "invalid_key");
  assert.equal(status.appleStatus, null);
  assert.equal(JSON.stringify(status).includes(SECRET_BODY), false);
});

test("availability 200 means WeatherKit auth works", async () => {
  let requested = null;
  const status = await probeWeatherKitAuth(envWith(pem()), {
    fetchImpl: async (url, init) => {
      requested = { url, authorization: init.headers.Authorization };
      return {
        ok: true,
        status: 200,
        json: async () => ({ datasets: ["currentWeather", "forecastHourly", "weatherAlerts"] }),
      };
    },
  });
  assert.equal(status.ok, true);
  assert.equal(status.auth, "ok");
  assert.equal(status.appleStatus, 200);
  assert.deepEqual(status.datasets, ["currentWeather", "forecastHourly", "weatherAlerts"]);
  assert.equal(requested.url, WEATHERKIT_AVAILABILITY_URL);
  assert.match(requested.authorization, /^Bearer\s+\S+/);
  assert.equal(JSON.stringify(status).includes(requested.authorization), false);
});

test("Apple 401 is rejected without treating secret presence as success", async () => {
  const status = await probeWeatherKitAuth(envWith(pem()), {
    fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({}) }),
  });
  assert.equal(status.configured, true);
  assert.equal(status.ok, false);
  assert.equal(status.auth, "rejected");
  assert.equal(status.appleStatus, 401);
});

test("network failure is unreachable", async () => {
  const status = await probeWeatherKitAuth(envWith(pem()), {
    fetchImpl: async () => {
      throw new Error("network down");
    },
  });
  assert.equal(status.auth, "unreachable");
  assert.equal(status.ok, false);
});

test("sanitize strips bearer tokens and PEM blocks", () => {
  const cleaned = sanitizeWeatherKitError(
    "fail Bearer abc.def.ghi -----BEGIN PRIVATE KEY-----\nSECRET\n-----END PRIVATE KEY-----"
  );
  assert.equal(cleaned.includes("abc.def.ghi"), false);
  assert.equal(cleaned.includes("SECRET"), false);
  assert.match(cleaned, /\[redacted key\]/);
});
