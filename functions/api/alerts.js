const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "YouNeeKProRadar/1.0 (alerts)",
};

const ALERT_EVENTS = {
  tornado: ["Tornado Warning"],
  tornado_watch: ["Tornado Watch"],
  thunderstorm: ["Severe Thunderstorm Warning"],
  flood: ["Flood Warning", "Flash Flood Warning", "Flood Watch", "Flash Flood Watch"],
  winter: [
    "Winter Storm Warning",
    "Blizzard Warning",
    "Ice Storm Warning",
    "Winter Weather Advisory",
    "Blizzard Watch",
    "Winter Storm Watch",
  ],
  heat: ["Heat Advisory", "Excessive Heat Warning", "Excessive Heat Watch"],
  wind: ["High Wind Warning", "High Wind Watch", "Wind Advisory"],
  fire: ["Red Flag Warning", "Fire Weather Watch"],
  fog: ["Dense Fog Advisory"],
};

async function fetchEvents(events) {
  const results = await Promise.all(
    events.map(async (event) => {
      const url = `https://api.weather.gov/alerts/active?status=actual&event=${encodeURIComponent(event)}`;
      const response = await fetch(url, { headers: NWS_HEADERS });
      if (!response.ok) {
        throw new Error(`NWS ${response.status} for ${event}`);
      }
      return response.json();
    })
  );

  const features = [];
  const seen = new Set();

  for (const payload of results) {
    for (const feature of payload?.features || []) {
      const id = feature?.id || feature?.properties?.id;
      const key = id || JSON.stringify(feature?.geometry?.coordinates?.[0]?.[0]);
      if (seen.has(key)) continue;
      seen.add(key);
      features.push(feature);
    }
  }

  return {
    type: "FeatureCollection",
    features,
    title: "Active weather alerts",
    updated: new Date().toISOString(),
  };
}

async function fetchPointAlerts(point) {
  const url = `https://api.weather.gov/alerts/active?status=actual&point=${encodeURIComponent(point)}`;
  const response = await fetch(url, { headers: NWS_HEADERS });
  if (!response.ok) {
    throw new Error(`NWS ${response.status} for point alerts`);
  }
  const payload = await response.json();
  return {
    type: "FeatureCollection",
    features: payload?.features || [],
    title: "Active local alerts",
    updated: new Date().toISOString(),
  };
}

export async function onRequestGet(context) {
  const search = new URL(context.request.url).searchParams;
  const point = search.get("point");
  const type = search.get("type") || "tornado";

  try {
    if (point) {
      return Response.json(await fetchPointAlerts(point), {
        headers: { "Cache-Control": "public, max-age=60" },
      });
    }

    const events = ALERT_EVENTS[type];
    if (!events) {
      return Response.json({ error: `Unknown alert type: ${type}` }, { status: 400 });
    }

    return Response.json(await fetchEvents(events), {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    return Response.json(
      { type: "FeatureCollection", features: [], error: err.message || "Alerts unavailable" },
      { status: 502 }
    );
  }
}
