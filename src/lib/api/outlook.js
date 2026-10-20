import { fetchNwsPointAlerts } from "./nwsAlerts";

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
  const alerts = await fetchNwsPointAlerts(lat, lon);
  return {
    alerts,
    features: alerts.map((alert) => ({
      id: alert.id,
      properties: {
        event: alert.name,
        headline: alert.description,
        description: alert.description,
        severity: alert.severity,
        urgency: alert.urgency,
        certainty: alert.certainty,
        sent: alert.issued,
        effective: alert.issued,
        expires: alert.expires,
        ends: alert.expires,
        senderName: alert.source || "NWS",
        web: alert.url,
      },
    })),
  };
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
