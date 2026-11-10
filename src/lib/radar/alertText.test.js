import assert from "node:assert/strict";
import test from "node:test";
import { alertSummary, warningFeatures } from "./alertText.js";

test("warning polygons keep the full NWS text and watches stay out of the list", () => {
  const collection = {
    features: [
      {
        id: "tornado-1",
        properties: {
          event: "Tornado Warning",
          headline: "Tornado Warning issued",
          description: "TAKE COVER NOW.<br/>Move to an interior room.",
          instruction: "Seek shelter.",
          areaDesc: "Tulsa County",
          senderName: "NWS Tulsa",
        },
      },
      { id: "watch-1", properties: { event: "Tornado Watch", description: "Watch text" } },
    ],
  };
  const warnings = warningFeatures(collection);
  assert.equal(warnings.length, 1);
  const summary = alertSummary(warnings[0]);
  assert.equal(summary.event, "Tornado Warning");
  assert.match(summary.description, /TAKE COVER NOW\.\nMove to an interior room\./);
  assert.equal(summary.instruction, "Seek shelter.");
  assert.equal(summary.area, "Tulsa County");
});
