export async function fetchWeatherNews() {
  const response = await fetch("/api/news");
  if (response.ok) return response.json();
  return fetchNewsFallback();
}

export async function fetchNewsFallback() {
  const response = await fetch("https://api.weather.gov/alerts/active?status=actual&message_type=alert", {
    headers: { Accept: "application/geo+json" },
  });
  if (!response.ok) return { stories: [] };
  const payload = await response.json();
  const seen = new Set();
  const stories = (payload.features || [])
    .map((feature) => {
      const properties = feature.properties || {};
      return {
        id: feature.id,
        title: properties.headline || properties.event || "Weather alert",
        summary: (properties.description || "").split("\n")[0]?.slice(0, 220) || properties.instruction || "",
        event: properties.event,
        severity: properties.severity,
        area: properties.areaDesc,
        sent: properties.sent,
        url: properties["@id"] || properties.id,
      };
    })
    .filter((story) => {
      const key = `${story.event}-${story.area}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 16);

  return { stories, source: "NWS alerts" };
}
