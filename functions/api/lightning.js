const IEM_HEADERS = { "User-Agent": "YouNeeKProRadar/1.0 (lightning)" };

function ageMinutes(iso) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return null;
  return Math.max(0, Math.round((Date.now() - time) / 60000));
}

export async function onRequestGet() {
  try {
    const url = "https://mesonet.agron.iastate.edu/geojson/lsr.geojson?hours=6";
    const response = await fetch(url, { headers: IEM_HEADERS });
    if (!response.ok) {
      return Response.json({ strikes: [], error: `IEM ${response.status}` }, { status: 502 });
    }

    const payload = await response.json();
    const strikes = (payload.features || [])
      .map((feature) => {
        const properties = feature.properties || {};
        const type = String(properties.type || "").toUpperCase();
        const typetext = String(properties.typetext || "").toUpperCase();
        const isLightning = type === "L" || typetext.includes("LIGHTNING");
        const isStorm =
          typetext.includes("TSTM") || typetext.includes("HAIL") || typetext.includes("THUNDER");
        if (!isLightning && !isStorm) return null;
        const lat = Number(properties.lat ?? feature.geometry?.coordinates?.[1]);
        const lon = Number(properties.lon ?? feature.geometry?.coordinates?.[0]);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return {
          lat,
          lon,
          ageMinutes: ageMinutes(properties.valid),
          source: properties.typetext || properties.city || "Storm report",
          kind: isLightning ? "lightning" : "storm",
        };
      })
      .filter(Boolean)
      .slice(0, 250);

    return Response.json(
      { strikes, updated: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch (error) {
    return Response.json({ strikes: [], error: error.message }, { status: 502 });
  }
}
