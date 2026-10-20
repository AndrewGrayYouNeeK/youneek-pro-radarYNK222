export async function fetchNwsPointAlerts(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  const response = await fetch(`/api/point-alerts?${params.toString()}`);
  if (!response.ok) return [];
  const payload = await response.json().catch(() => ({}));
  return Array.isArray(payload.alerts) ? payload.alerts : [];
}
