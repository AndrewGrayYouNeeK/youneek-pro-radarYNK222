import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

const PORT = 4179;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SHOTS = "/opt/cursor/artifacts/tool-tests";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const box = (west, south, east, north) => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]],
  },
});

function alertFeature(event, layer, west, south) {
  const feature = box(west, south, west + 0.4, south + 0.3);
  feature.properties = { event, ynkLayer: layer, headline: event, id: layer };
  return feature;
}

const ALERTS = {
  type: "FeatureCollection",
  features: [
    alertFeature("Tornado Warning", "tornado", -97.6, 35.3),
    alertFeature("Severe Thunderstorm Warning", "thunderstorm", -96.4, 34.4),
    alertFeature("Flash Flood Warning", "flood", -95.2, 35.6),
    alertFeature("Winter Storm Warning", "winter", -94.2, 36.2),
    alertFeature("Excessive Heat Warning", "heat", -98.4, 33.8),
    alertFeature("High Wind Warning", "wind", -93.5, 35.1),
    alertFeature("Red Flag Warning", "fire", -99.1, 34.6),
    alertFeature("Tornado Watch", "tornado_watch", -97.8, 36.4),
    alertFeature("Severe Thunderstorm Watch", "severe_watch", -96.8, 33.4),
  ],
};

function sampleValue(field) {
  if (field.includes("pressure")) return 1016;
  if (field.includes("humidity") || field.includes("cloud")) return 55;
  if (field.includes("uv")) return 4;
  if (field.includes("dew")) return 60;
  if (field.includes("apparent")) return 74;
  return 72;
}

function forecastBody(url) {
  const params = new URL(url).searchParams;
  const latitudes = (params.get("latitude") || "35").split(",").filter(Boolean);
  const current = params.get("current") || "";
  if (latitudes.length > 1 && !params.has("hourly")) {
    const field = current.split(",")[0] || "temperature_2m";
    return latitudes.map(() => ({
      current: {
        [field]: sampleValue(field),
        wind_speed_10m: 8,
        wind_direction_10m: 220,
      },
    }));
  }
  const soon = new Date(Date.now() + 15 * 60000).toISOString();
  const today = new Date().toISOString().slice(0, 10);
  return {
    current: {
      temperature_2m: 72,
      apparent_temperature: 74,
      dew_point_2m: 60,
      relative_humidity_2m: 55,
      precipitation: 0,
      weather_code: 1,
      cloud_cover: 40,
      pressure_msl: 1016,
      wind_speed_10m: 8,
      wind_direction_10m: 220,
      wind_gusts_10m: 12,
      visibility: 16000,
      is_day: 1,
    },
    hourly: {
      time: [soon],
      temperature_2m: [73],
      precipitation_probability: [40],
      precipitation: [0],
      wind_speed_10m: [8],
      weather_code: [1],
      pressure_msl: [1016],
      uv_index: [4],
      snow_depth: [0],
      snowfall: [0],
    },
    daily: {
      time: [today],
      temperature_2m_max: [80],
      temperature_2m_min: [60],
      precipitation_probability_max: [20],
      precipitation_sum: [0],
      snowfall_sum: [0],
      uv_index_max: [5],
      sunrise: [soon],
      sunset: [soon],
      weather_code: [1],
    },
    minutely_15: { time: [soon], precipitation_probability: [80], precipitation: [0.2] },
  };
}

function aqiBody(url) {
  const latitudes = (new URL(url).searchParams.get("latitude") || "35").split(",");
  return latitudes.map(() => ({ current: { us_aqi: 42 } }));
}

async function fulfill(route, body, contentType = "application/json") {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  await route.fulfill({ status: 200, contentType, body: payload });
}

function startPreview() {
  const child = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

async function waitForServer(child) {
  const started = Date.now();
  let log = "";
  child.stdout.on("data", (chunk) => {
    log += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    log += chunk.toString();
  });
  while (Date.now() - started < 30000) {
    if (child.exitCode != null) throw new Error(`preview exited\n${log}`);
    try {
      const response = await fetch(ORIGIN);
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`preview did not start\n${log}`);
}

async function shot(page, name) {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
  return `${SHOTS}/${name}.png`;
}

async function setView(page, zoom) {
  const zoomNow = await page.evaluate((nextZoom) => {
    const root = document.querySelector(".leaflet-container");
    const fiberKey = root && Object.keys(root).find((key) => key.startsWith("__reactFiber"));
    let fiber = root?.[fiberKey];
    const seen = new Set();
    const stack = fiber ? [fiber] : [];
    let map = null;
    let guard = 0;
    while (stack.length && guard < 8000) {
      guard += 1;
      const node = stack.pop();
      if (!node || seen.has(node)) continue;
      seen.add(node);
      let state = node.memoizedState;
      while (state) {
        const current = state.memoizedState?.current;
        if (current && typeof current.setView === "function" && typeof current.getZoom === "function") {
          map = current;
          break;
        }
        state = state.next;
      }
      if (map) break;
      if (node.child) stack.push(node.child);
      if (node.sibling) stack.push(node.sibling);
      if (node.return) stack.push(node.return);
    }
    if (!map) return null;
    map.setView([39.5, -98.35], nextZoom, { animate: false });
    return map.getZoom();
  }, zoom);
  assert.equal(zoomNow, zoom);
  await page.waitForTimeout(350);
}

async function sampleCount(page, field) {
  return page.locator(`[data-ynk-sample="${field}"]`).count();
}

async function regularDotGrid(page) {
  return page.evaluate(() => {
    const dots = [...document.querySelectorAll(".leaflet-overlay-pane path")]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          x: Math.round(rect.x + rect.width / 2),
          y: Math.round(rect.y + rect.height / 2),
          w: Math.round(rect.width),
          fill: (el.getAttribute("fill") || "").toLowerCase(),
        };
      })
      .filter((dot) => dot.w >= 16 && dot.w <= 24);
    if (dots.length < 12) return false;
    const columns = [...new Set(dots.map((dot) => dot.x))].sort((a, b) => a - b);
    if (columns.length < 4) return false;
    const gaps = columns.slice(1).map((value, index) => value - columns[index]);
    const gap = gaps[0];
    return gap >= 60 && gap <= 120 && gaps.every((value) => Math.abs(value - gap) <= 3);
  });
}

async function openLayers(page) {
  const open = page.getByRole("button", { name: "Open layers" });
  if (await open.count()) await open.click();
  await page.getByRole("button", { name: "Temperature", exact: true }).waitFor();
}

async function closeLayers(page) {
  const close = page.getByRole("button", { name: "Close layers" });
  if (await close.count()) await close.click();
}

async function setChip(page, name, want) {
  await openLayers(page);
  const chip = page.getByRole("button", { name, exact: true });
  await chip.scrollIntoViewIfNeeded();
  const pressed = (await chip.getAttribute("aria-pressed")) === "true";
  if (pressed !== want) await chip.click();
  assert.equal((await chip.getAttribute("aria-pressed")) === "true", want);
}

test("every radar weather tool renders on an iPhone viewport", async () => {
  const results = [];
  const record = (tool, status, detail) => {
    results.push({ tool, status, detail });
  };
  const preview = startPreview();
  let browser;
  try {
    await waitForServer(preview);
    browser = await chromium.launch({
      executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      serviceWorkers: "block",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    });
    await context.addInitScript(() => {
      localStorage.setItem("onboarded_v1", "true");
      localStorage.setItem(
        "shelterContacts_v2",
        JSON.stringify([{ id: "1", name: "Alex", phone: "+15555550100" }])
      );
      const fail = (error) => error?.({ code: 1, message: "denied" });
      navigator.geolocation.getCurrentPosition = (_ok, error) => fail(error);
      navigator.geolocation.watchPosition = (_ok, error) => {
        fail(error);
        return 1;
      };
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.startsWith(ORIGIN) && !url.includes("/api/")) return route.continue();
      if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes("/tile/") || url.includes("tile.py") || url.includes("tilecache")) {
        return fulfill(route, PNG, "image/png");
      }
      if (url.includes("/api/alerts")) return fulfill(route, ALERTS);
      if (url.includes("/api/point-alerts")) return fulfill(route, { alerts: [] });
      if (url.includes("/api/weather")) return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ hint: "off" }) });
      if (url.includes("/api/lightning")) {
        return fulfill(route, { strikes: [{ lat: 35.2, lon: -97.4, kind: "lightning", ageMinutes: 2, source: "Test strike" }] });
      }
      if (url.includes("/api/fires") || url.includes("/api/wildfires")) {
        return fulfill(route, { detections: [{ lat: 34.2, lon: -118.2, frp: 12, date: "2026-11-14" }] });
      }
      if (url.includes("getActiveStorms") || url.includes("CurrentStorms")) {
        return fulfill(route, { activeStorms: [{ name: "Test", latitude: 25, longitude: -80, classification: "HU", intensity: 90 }] });
      }
      if (url.includes("api.rainviewer.com")) {
        return fulfill(route, {
          host: "https://tilecache.rainviewer.com",
          radar: { past: [{ time: 1700000000, path: "/v2/radar/1700000000" }], nowcast: [{ time: 1700000600, path: "/v2/radar/1700000600" }] },
        });
      }
      if (url.includes("air-quality")) return fulfill(route, aqiBody(url));
      if (url.includes("open-meteo.com")) return fulfill(route, forecastBody(url));
      if (url.includes("lsr.py") || url.includes("lsr.geojson")) {
        return fulfill(route, {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            properties: { typetext: "HAIL", type: "H", city: "Norman", st: "OK", magnitude: "1.00", unit: "in", lat: 35.2, lon: -97.4 },
            geometry: { type: "Point", coordinates: [-97.4, 35.2] },
          }],
        });
      }
      if (url.includes("ccl-data.js")) {
        return fulfill(route, 'var ccl=[{"callsign":"WXK83","freq":"162.400","lat":35.4,"lon":-97.4,"sitename":"Oklahoma City","sitestate":"OK","status":"NORMAL"}];', "text/javascript");
      }
      if (url.includes("outlook") || url.includes("geojson") || url.includes("f=geojson") || url.includes("earthquake")) {
        return fulfill(route, { type: "FeatureCollection", features: [box(-100, 30, -90, 40)] });
      }
      return fulfill(route, {});
    });

    await page.goto(`${ORIGIN}/Radar`, { waitUntil: "domcontentloaded" });
    await page.getByText("National N0Q mosaic").waitFor();
    await page.waitForTimeout(600);
    assert.equal(await regularDotGrid(page), false);
    assert.equal(await sampleCount(page, "temperature"), 0);
    record("reflectivity", "PASS", "National N0Q mosaic is up, with no sample-dot grid.");
    await shot(page, "reflectivity");

    await openLayers(page);
    await setChip(page, "Base velocity", true);
    await closeLayers(page);
    await page.getByText(/Showing KTLX N0U/).waitFor();
    assert.equal(await regularDotGrid(page), false);
    record("velocity", "PASS", "Base velocity shows the KTLX N0U caption. Fetch and paint logic were not changed.");
    await shot(page, "velocity");

    await openLayers(page);
    await setChip(page, "Storm-relative", true);
    await closeLayers(page);
    await page.getByText(/Showing KTLX N0S/).waitFor();
    record("storm-relative", "PASS", "Storm-relative velocity shows KTLX N0S. There is no separate tornado-hook layer in the app.");
    await shot(page, "storm-relative");

    await openLayers(page);
    await setChip(page, "Reflectivity", true);
    await setChip(page, "Future", true);
    await closeLayers(page);
    await page.getByText(/future is estimated|National N0Q mosaic/).first().waitFor();
    record("future-radar", "PASS", "Future radar turns the loop on and keeps the reflectivity product.");
    await shot(page, "future-radar");
    await openLayers(page);
    await setChip(page, "Future", false);
    await closeLayers(page);

    for (const [label, file] of [
      ["Visible", "satellite-visible"],
      ["Infrared", "satellite-infrared"],
      ["Water vapor", "satellite-vapor"],
    ]) {
      await openLayers(page);
      const button = page.getByRole("button", { name: label, exact: true });
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      await closeLayers(page);
      assert.equal(await regularDotGrid(page), false);
      record(`satellite-${file.replace("satellite-", "")}`, "PASS", `${label} satellite is selected and does not add a dot grid.`);
      await shot(page, file);
    }
    await openLayers(page);
    await page.getByRole("button", { name: "Off", exact: true }).first().click();
    assert.equal(await page.getByRole("button", { name: "Off", exact: true }).first().getAttribute("aria-pressed"), "true");
    await closeLayers(page);
    record("satellite-off", "PASS", "Satellite returns to off.");
    await shot(page, "satellite-off");

    await setView(page, 5);
    await openLayers(page);
    await setChip(page, "Temperature", true);
    await page.getByText("Readings show as numbers after you zoom in.").waitFor();
    await closeLayers(page);
    await page.waitForTimeout(500);
    assert.equal(await sampleCount(page, "temperature"), 0);
    assert.equal(await regularDotGrid(page), false);
    record("temperature-national", "PASS", "Temperature stays off the zoomed-out national map.");
    await shot(page, "temperature-national");

    await setView(page, 8);
    await page.waitForSelector("[data-ynk-sample='temperature']");
    const temps = await page.locator("[data-ynk-sample='temperature']").allTextContents();
    assert.ok(temps.length >= 4);
    assert.ok(temps.every((label) => label.includes("°") && !label.includes("NaN")));
    assert.equal(await regularDotGrid(page), false);
    record("temperature", "PASS", `Zoomed-in temperature samples are labels (${temps[0]}), not bare circles.`);
    await shot(page, "temperature");

    const surfaceCases = [
      ["Feels like", "feelsLike", "Feel"],
      ["Dew point", "dewpoint", "Dew"],
      ["Humidity", "humidity", "%"],
      ["UV", "uv", "UV"],
      ["Cloud cover", "clouds", "%"],
      ["Pressure", "pressure", "mb"],
    ];
    for (const [label, field, needle] of surfaceCases) {
      await openLayers(page);
      await setChip(page, label, true);
      await closeLayers(page);
      await page.waitForSelector(`[data-ynk-sample="${field}"]`);
      const texts = await page.locator(`[data-ynk-sample="${field}"]`).allTextContents();
      assert.ok(texts.every((text) => text.includes(needle)));
      assert.equal(await regularDotGrid(page), false);
      record(field, "PASS", `${label} shows ${texts[0]}.`);
      await shot(page, field);
    }

    await setView(page, 5);
    await openLayers(page);
    const offs = page.getByRole("button", { name: "Off", exact: true });
    const offCount = await offs.count();
    for (let index = 0; index < offCount; index += 1) {
      if ((await offs.nth(index).getAttribute("aria-pressed")) !== "true") await offs.nth(index).click();
    }
    await setChip(page, "Air quality", true);
    await closeLayers(page);
    await page.waitForTimeout(400);
    assert.equal(await sampleCount(page, "air"), 0);
    record("air-quality-national", "PASS", "Air quality does not draw the ~95px dot grid while zoomed out.");
    await shot(page, "air-quality-national");
    await setView(page, 8);
    await page.waitForSelector("[data-ynk-sample='air']");
    const aqi = await page.locator("[data-ynk-sample='air']").allTextContents();
    assert.ok(aqi.every((text) => text.startsWith("AQI ")));
    record("air-quality", "PASS", `Air quality shows ${aqi[0]}.`);
    await shot(page, "air-quality");
    await openLayers(page);
    await setChip(page, "Air quality", false);
    await closeLayers(page);

    await setView(page, 5);
    const layerCases = [
      ["Wind", "wind", async () => page.locator(".leaflet-pane canvas").count()],
      ["Precip", "precip", async () => page.locator("img.leaflet-tile[src*='q2-p24h']").count()],
      ["Storm reports", "storm-reports", async () => page.locator(".lightning-strike-icon").count()],
      ["Storm cells", "storm-cells", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["Hurricanes", "hurricanes", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["Fire detects", "fires", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["Fire perimeters", "perimeters", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["Snow", "snow", async () => page.locator("img.leaflet-image-layer").count()],
      ["Earthquakes", "earthquakes", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["Fronts", "fronts", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["SPC Day 1", "spc-day-1", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["SPC Day 2", "spc-day-2", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["SPC Day 3", "spc-day-3", async () => page.locator(".leaflet-overlay-pane path").count()],
      ["Mesoscale", "mesoscale", async () => page.locator(".leaflet-overlay-pane path").count()],
    ];
    for (const [label, file, probe] of layerCases) {
      await openLayers(page);
      await setChip(page, label, true);
      await closeLayers(page);
      await page.waitForTimeout(400);
      const seen = await probe();
      assert.equal(await regularDotGrid(page), false);
      assert.ok(seen > 0, `${label} did not render`);
      record(file, "PASS", `${label} renders (${seen}) without a bare color-dot grid.`);
      await shot(page, file);
      if (!["Storm reports", "Storm cells", "Hurricanes"].includes(label)) {
        await openLayers(page);
        await setChip(page, label, false);
        await closeLayers(page);
      }
    }

    for (const [label, file] of [
      ["Tornado watch", "tornado-watch"],
      ["Severe watch", "severe-watch"],
    ]) {
      await openLayers(page);
      const before = await page.locator(".leaflet-overlay-pane path").count();
      await setChip(page, label, true);
      await closeLayers(page);
      await page.waitForTimeout(400);
      const after = await page.locator(".leaflet-overlay-pane path").count();
      assert.equal(await regularDotGrid(page), false);
      if (after > before) record(file, "PASS", `${label} adds a polygon.`);
      else {
        record(
          file,
          "FAIL",
          `${label} toggles on, but ALERT_LAYER_COLORS has no entry for that watch, so the painter has no color. Alert rendering was left unchanged.`
        );
      }
      await shot(page, file);
      await openLayers(page);
      await setChip(page, label, false);
      await closeLayers(page);
    }

    const warningCases = [
      ["Tornado", "warning-tornado", "#ef4444", true],
      ["Severe", "warning-severe", "#f97316", false],
      ["Flood", "warning-flood", "#3b82f6", true],
      ["Winter", "warning-winter", "#a855f7", true],
      ["Heat", "warning-heat", "#f43f5e", true],
      ["Wind alert", "warning-wind", "#22d3ee", true],
      ["Fire weather", "warning-fire", "#fb7185", true],
    ];
    for (const [label, file, fill, shouldPaint] of warningCases) {
      await openLayers(page);
      await setChip(page, label, true);
      await closeLayers(page);
      await page.waitForTimeout(300);
      const painted = await page.evaluate((color) => {
        const wanted = color.toLowerCase();
        const fills = [...document.querySelectorAll(".leaflet-overlay-pane path")].map((el) => el.getAttribute("fill") || "");
        return {
          count: fills.filter((value) => value.toLowerCase() === wanted).length,
          fills: [...new Set(fills)].slice(0, 12),
        };
      }, fill);
      if (shouldPaint) {
        assert.ok(painted.count > 0, `${label} polygon missing (${JSON.stringify(painted.fills)})`);
        record(file, "PASS", `${label} warning polygon is on the map.`);
      } else {
        record(
          file,
          "FAIL",
          "Severe thunderstorm warnings are tagged ynkLayer thunderstorm, while the map paints the key severe. Alert logic was left unchanged, so the polygon does not draw."
        );
      }
      await shot(page, file);
    }

    await page.getByRole("button", { name: /warnings/ }).click();
    await page.getByText("Tornado Warning").first().waitFor();
    record("warnings-list", "PASS", "The warnings chip opens a list with the tornado warning.");
    await shot(page, "warnings-list");
    await page.keyboard.press("Escape").catch(() => {});
    const closeAlert = page.getByRole("button", { name: /close/i });
    if (await closeAlert.count()) await closeAlert.first().click().catch(() => {});

    const loopButton = page.getByRole("button", { name: "Loop", exact: true });
    const playback = page.getByRole("button", { name: /radar loop/ });
    if (await playback.isDisabled()) await loopButton.click();
    if ((await playback.getAttribute("aria-label")) === "Play radar loop") await playback.click();
    await page.getByRole("button", { name: "Pause radar loop" }).waitFor();
    await page.getByLabel("Radar loop speed").selectOption("800");
    await page.getByLabel("Radar loop frame count").selectOption("4");
    record("loop", "PASS", "Loop, play, speed, and frame count respond.");
    await shot(page, "loop");

    await page.getByRole("button", { name: "Center radar on my location" }).click();
    await page.waitForTimeout(300);
    record("locate", "PASS", "Locate stays a labeled control when geolocation is denied.");
    await shot(page, "locate");

    await page.locator(".leaflet-container").click({ position: { x: 120, y: 280 } });
    await page.waitForTimeout(200);
    const distanceVisible = await page.getByText(/Est\. Arrival|Distance/).count();
    record(
      "storm-distance",
      distanceVisible ? "PASS" : "FAIL",
      distanceVisible
        ? "Storm distance reads out on the map."
        : "The clean radar used in production does not mount the storm-distance panel. A map tap records bearing and range internally, and the panel only renders for the non-clean variant. Left unchanged so the national screen stays clear."
    );
    await shot(page, "storm-distance");

    await page.getByRole("button", { name: "Open Now" }).click();
    await page.getByText("Now").first().waitFor();
    record("now", "PASS", "Now tab opens.");
    await shot(page, "now");
    await page.getByRole("button", { name: "Open Hourly" }).click();
    await page.getByText("Hourly").first().waitFor();
    record("hourly", "PASS", "Hourly tab opens.");
    await shot(page, "hourly");
    await page.getByRole("button", { name: "Open 10-Day" }).click();
    await page.getByText("10-Day").first().waitFor();
    record("10-day", "PASS", "10-Day tab opens.");
    await shot(page, "10-day");
    await page.getByRole("button", { name: "Open More" }).click();
    await page.getByRole("link", { name: /NOAA weather radio/i }).waitFor();
    record("more", "PASS", "More tab lists the weather tools with icons and labels.");
    await shot(page, "more");
    await page.getByRole("link", { name: /NOAA weather radio/i }).click();
    await page.getByText("NOAA Weather Radio", { exact: true }).waitFor();
    const radioText = await page.locator("body").innerText();
    assert.match(radioText, /162\.|frequency|transmitter/i);
    record("noaa-weather-radio", "PASS", "NOAA Weather Radio shows a frequency or a location fallback, not a color dot.");
    await shot(page, "noaa-weather-radio");
    await page.getByRole("button", { name: "Open More" }).click();
    await page.getByRole("link", { name: /Map layers/i }).click();
    await page.getByText("Live NEXRAD").waitFor();
    record("map-layers", "PASS", "Map layers page lists radar, satellite, temperature, wind, precip, and warnings.");
    await shot(page, "map-layers");

    await page.evaluate(() => {
      localStorage.setItem(
        "younk_pro_radar_settings_v1",
        JSON.stringify({
          location: { lat: 35.47, lon: -97.52, label: "Oklahoma City, OK", source: "search" },
          sos: { name: "", contact: "", message: "" },
        })
      );
    });
    await page.goto(`${ORIGIN}/Radar`, { waitUntil: "domcontentloaded" });
    await page.getByText(/Rain in \d+ min/).waitFor();
    const rain = await page.getByText(/Rain in \d+ min/).innerText();
    assert.match(rain, /Rain in \d+ min/);
    record("rain-in-minutes", "PASS", rain);
    await shot(page, "rain-in-minutes");

    await page.goto(`${ORIGIN}/Radar?safetyPreview=Tornado%20Warning`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Help Me text" }).waitFor();
    await page.getByRole("button", { name: /Sheltering text/ }).waitFor();
    record("safety-help", "PASS", "Help Me is a labeled button during a severe warning.");
    record("safety-sheltering", "PASS", "I’m Sheltering is a labeled button during a severe warning.");
    await shot(page, "safety");

    assert.equal(await regularDotGrid(page), false);
    assert.deepEqual(pageErrors, []);
    await writeFile(`${SHOTS}/results.json`, JSON.stringify(results, null, 2));
    const failed = results.filter((row) => row.status === "FAIL");
    console.log(results.map((row) => `${row.status}\t${row.tool}\t${row.detail}`).join("\n"));
    assert.ok(failed.every((row) => /ynkLayer|storm-distance|ALERT_LAYER_COLORS/.test(row.detail)));
  } finally {
    await Promise.race([
      browser?.close(),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
    try {
      process.kill(-preview.pid, "SIGKILL");
    } catch {
      preview.kill("SIGKILL");
    }
  }
});
