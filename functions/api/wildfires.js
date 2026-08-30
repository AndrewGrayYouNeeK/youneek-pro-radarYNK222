export async function onRequestGet() {
  try {
    const response = await fetch(
      "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=60",
      { headers: { "User-Agent": "YouNeeKProRadar/1.0 (wildfires)" } }
    );
    if (!response.ok) {
      return Response.json({ fires: [], error: `EONET ${response.status}` }, { status: 502 });
    }

    const payload = await response.json();
    const fires = (payload.events || [])
      .map((event) => {
        const geometry = event.geometry?.[event.geometry.length - 1];
        const coords = geometry?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return null;
        return {
          id: event.id,
          title: event.title,
          lat: Number(coords[1]),
          lon: Number(coords[0]),
          date: geometry.date,
          link: event.sources?.[0]?.url || event.link,
        };
      })
      .filter(Boolean);

    return Response.json(
      { fires, source: "NASA EONET", updated: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (error) {
    return Response.json({ fires: [], error: error.message }, { status: 502 });
  }
}
