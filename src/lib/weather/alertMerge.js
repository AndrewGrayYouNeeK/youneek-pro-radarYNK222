function alertName(alert) {
  return String(alert?.name || alert?.event || "").trim();
}

export function alertDedupeKey(alert) {
  return alertName(alert)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sourceLabel(alert, fallback) {
  const source = String(alert?.source || "").trim();
  if (!source) return fallback;
  if (source.toLowerCase() === fallback.toLowerCase()) return fallback;
  return source;
}

export function mergeWeatherAlerts(nwsAlerts = [], appleAlerts = []) {
  const nws = Array.isArray(nwsAlerts) ? nwsAlerts : [];
  const apple = Array.isArray(appleAlerts) ? appleAlerts : [];
  const appleByKey = new Map();
  for (const alert of apple) {
    const key = alertDedupeKey(alert);
    if (key && !appleByKey.has(key)) appleByKey.set(key, alert);
  }

  const merged = [];
  const seen = new Set();

  for (const alert of nws) {
    const key = alertDedupeKey(alert);
    const match = key ? appleByKey.get(key) : null;
    if (key) seen.add(key);
    const sources = match ? ["NWS", "Apple Weather"] : [sourceLabel(alert, "NWS")];
    merged.push({
      ...alert,
      name: alertName(alert) || alertName(match) || "Weather alert",
      description: alert.description || match?.description || "",
      severity: alert.severity || match?.severity || "",
      urgency: alert.urgency || match?.urgency || "",
      certainty: alert.certainty || match?.certainty || "",
      expires: alert.expires || match?.expires || null,
      url: alert.url || match?.url || "",
      source: sources.join(" · "),
      sources,
    });
  }

  for (const alert of apple) {
    const key = alertDedupeKey(alert);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    merged.push({
      ...alert,
      name: alertName(alert) || "Weather alert",
      source: `Apple Weather${alert.source && alert.source !== "Apple Weather" ? ` · ${alert.source}` : ""}`,
      sources: ["Apple Weather"],
    });
  }

  return merged;
}
