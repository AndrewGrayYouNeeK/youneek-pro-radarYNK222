export async function fetchWildfires() {
  const response = await fetch("/api/wildfires");
  if (!response.ok) throw new Error("Wildfire data unavailable");
  return response.json();
}

export async function fetchWildfiresDirect() {
  const url = "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=60";
  const response = await fetch(url);
  if (!response.ok) throw new Error("EONET unavailable");
  const payload = await response.json();
  return (payload.events || [])
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
}
