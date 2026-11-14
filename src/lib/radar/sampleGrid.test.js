import assert from "node:assert/strict";
import test from "node:test";
import { formatSampleLabel, sampleLabelInk, shouldDrawSampleGrid } from "./sampleGrid.js";

test("sample grids stay off the zoomed-out national radar", () => {
  assert.equal(shouldDrawSampleGrid(4), false);
  assert.equal(shouldDrawSampleGrid(5), false);
  assert.equal(shouldDrawSampleGrid(5.5), false);
  assert.equal(shouldDrawSampleGrid(Number.NaN), false);
  assert.equal(shouldDrawSampleGrid(6), true);
  assert.equal(shouldDrawSampleGrid(8), true);
});

test("sample labels name the reading instead of a bare color", () => {
  assert.equal(formatSampleLabel("temperature", 72.4), "72°");
  assert.equal(formatSampleLabel("feelsLike", 71.2), "Feel 71°");
  assert.equal(formatSampleLabel("dewpoint", 60), "Dew 60°");
  assert.equal(formatSampleLabel("humidity", 54.6), "55%");
  assert.equal(formatSampleLabel("clouds", 80), "80%");
  assert.equal(formatSampleLabel("uv", 3.2), "UV 3");
  assert.equal(formatSampleLabel("pressure", 1016.4), "1016 mb");
  assert.equal(formatSampleLabel("air", 42), "AQI 42");
  assert.equal(formatSampleLabel("temperature", null), null);
});

test("sample label ink stays readable on light and dark swatches", () => {
  assert.equal(sampleLabelInk("#e2e8f0"), "#0f172a");
  assert.equal(sampleLabelInk("#ef4444"), "#f8fafc");
  assert.equal(sampleLabelInk("blue"), "#0f172a");
});
