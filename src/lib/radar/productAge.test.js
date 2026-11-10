import assert from "node:assert/strict";
import test from "node:test";
import { NATIONAL_MOSAIC_ID } from "./ridgeTiles.js";
import { latestProductScanUnix, scanTargets, scanUnixFromPayload } from "./productAge.js";

test("mosaic age uses the national composite and a site uses that radar", () => {
  assert.deepEqual(scanTargets(NATIONAL_MOSAIC_ID, "reflectivity"), [{ radar: "USCOMP", product: "N0Q" }]);
  assert.equal(scanTargets("KHTX", "reflectivity")[0].radar, "HTX");
  assert.equal(scanTargets("KHTX", "reflectivity")[0].product, "N0B");
  assert.equal(scanTargets("KLVX", "stormRelative")[0].product, "N0S");
});

test("a scan timestamp becomes unix seconds", () => {
  assert.equal(scanUnixFromPayload({ scans: [{ ts: "2026-11-10T10:35Z" }] }), Date.parse("2026-11-10T10:35Z") / 1000);
  assert.equal(scanUnixFromPayload({ scans: [] }), null);
});

test("product age skips an empty product and uses the next scan", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const empty = url.includes("product=N0U");
    return {
      ok: true,
      json: async () => (empty ? { scans: [] } : { scans: [{ ts: "2026-11-10T10:28Z" }] }),
    };
  };
  const time = await latestProductScanUnix("KTLX", "velocity", fetchImpl);
  assert.equal(time, Date.parse("2026-11-10T10:28Z") / 1000);
  assert.equal(calls.length, 2);
});
