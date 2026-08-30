export async function onRequestGet() {
  const response = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
    headers: { Accept: "application/json", "User-Agent": "YouNeeKProRadar/1.0 (radar)" },
  });
  if (!response.ok) {
    return Response.json({ error: `RainViewer ${response.status}` }, { status: 502 });
  }

  const payload = await response.json();
  const host = payload.host || "https://tilecache.rainviewer.com";
  const past = (payload?.radar?.past || []).map((frame) => ({
    time: frame.time,
    path: frame.path,
    kind: "past",
    host,
  }));
  const nowcast = (payload?.radar?.nowcast || []).map((frame) => ({
    time: frame.time,
    path: frame.path,
    kind: "future",
    host,
  }));
  const satellite = (payload?.satellite?.infrared || []).map((frame) => ({
    time: frame.time,
    path: frame.path,
    kind: "satellite",
    host,
  }));

  return Response.json(
    {
      host,
      generated: payload.generated,
      past,
      nowcast,
      radar: [...past, ...nowcast],
      satellite,
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
