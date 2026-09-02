export async function fetchStormOutlook(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  const response = await fetch(`/api/outlook?${params.toString()}`);
  if (!response.ok) throw new Error("Storm outlook unavailable");
  return response.json();
}

export async function fetchPointAlerts(lat, lon) {
  const params = new URLSearchParams({
    point: `${lat},${lon}`,
  });
  const response = await fetch(`/api/alerts?${params.toString()}`);
  if (!response.ok) throw new Error("Alerts unavailable");
  return response.json();
}

export async function fetchFires() {
  const response = await fetch("/api/fires");
  if (!response.ok) throw new Error("Fire data unavailable");
  return response.json();
}

export async function fetchLightning() {
  const response = await fetch("/api/lightning");
  if (!response.ok) throw new Error("Lightning unavailable");
  return response.json();
}

export async function fetchActiveStorms() {
  const response = await fetch("/api/getActiveStorms");
  if (!response.ok) throw new Error("Hurricane data unavailable");
  return response.json();
}
