import assert from "node:assert/strict";
import test from "node:test";
import { mapNwsFeature } from "./point-alerts.js";
import { isWeatherEmergency } from "../../src/lib/safety/weatherEmergency.js";

test("NWS point features map into app alerts and emergency warnings", () => {
  const alert = mapNwsFeature({
    id: "https://api.weather.gov/alerts/urn:oid:1",
    properties: {
      event: "Tornado Warning",
      headline: "Tornado Warning for Adair County",
      severity: "Extreme",
      urgency: "Immediate",
      ends: "2099-01-01T00:00:00Z",
    },
  });
  assert.equal(alert.name, "Tornado Warning");
  assert.equal(alert.source, "NWS");
  assert.equal(isWeatherEmergency(alert), true);
});
