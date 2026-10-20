import assert from "node:assert/strict";
import test from "node:test";
import { landingWranglerToml, workersBuildsPreview, workersBuildsTarget } from "./deploy-website.mjs";

test("Workers Builds on YNK222 deploys the weather app, and the landing name deploys the landing site", () => {
  assert.equal(
    workersBuildsTarget({
      WORKERS_CI: "1",
      WRANGLER_CI_OVERRIDE_NAME: "youneek-pro-radarynk222",
      WRANGLER_CI_MATCH_TAG: "abc",
    }),
    "weather"
  );
  assert.equal(
    workersBuildsTarget({
      WORKERS_CI: "1",
      WRANGLER_CI_OVERRIDE_NAME: "youneek-pro-radar-landing",
    }),
    "landing"
  );
  assert.equal(workersBuildsTarget({}), null);
});

test("non-main Workers Builds branches are previews", () => {
  assert.equal(workersBuildsPreview({ WORKERS_CI_BRANCH: "cursor/port-baby-features-split-landing-c4ad" }), true);
  assert.equal(workersBuildsPreview({ WORKERS_CI_BRANCH: "main" }), false);
});

test("generated landing config is a separate Worker and does not attach DNS", () => {
  const toml = landingWranglerToml("/tmp/dist-landing");
  assert.match(toml, /name = "youneek-pro-radar-landing"/);
  assert.match(toml, /SITE_ROLE = "landing"/);
  assert.match(toml, /directory = "\/tmp\/dist-landing"/);
  assert.doesNotMatch(toml, /custom_domain/);
  assert.doesNotMatch(toml, /youneekproradar\.com/);
});
