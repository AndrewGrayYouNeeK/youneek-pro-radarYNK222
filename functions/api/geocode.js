export async function onRequestGet(context) {
  const query = new URL(context.request.url).searchParams.get("q")?.trim();
  if (!query) {
    return Response.json({ results: [], error: "q is required" }, { status: 400 });
  }

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    return Response.json({ results: [], error: `Geocode ${response.status}` }, { status: 502 });
  }

  const payload = await response.json();
  const results = (payload.results || []).map((result) => ({
    label: [result.name, result.admin1, result.country].filter(Boolean).join(", "),
    city: result.name,
    state: result.admin1 || result.country_code,
    lat: result.latitude,
    lon: result.longitude,
  }));

  return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=300" } });
}
