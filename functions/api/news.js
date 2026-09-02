const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "YouNeeKProRadar/1.0 (news)" };

export async function onRequestGet() {
  try {
    const response = await fetch(
      "https://api.weather.gov/alerts/active?status=actual&message_type=alert",
      { headers: NWS_HEADERS }
    );
    if (!response.ok) {
      return Response.json({ stories: [], error: `NWS ${response.status}` }, { status: 502 });
    }

    const payload = await response.json();
    const seen = new Set();
    const stories = (payload.features || [])
      .map((feature) => {
        const properties = feature.properties || {};
        return {
          id: feature.id,
          title: properties.headline || properties.event || "Weather alert",
          summary: String(properties.description || properties.instruction || "")
            .split("\n")
            .find(Boolean)
            ?.slice(0, 240) || "",
          event: properties.event,
          severity: properties.severity,
          area: properties.areaDesc,
          sent: properties.sent,
          url: properties.id,
        };
      })
      .filter((story) => {
        const key = `${story.event}|${story.area}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return Boolean(story.title);
      })
      .slice(0, 20);

    return Response.json(
      { stories, source: "National Weather Service", updated: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=120" } }
    );
  } catch (error) {
    return Response.json({ stories: [], error: error.message }, { status: 502 });
  }
}
