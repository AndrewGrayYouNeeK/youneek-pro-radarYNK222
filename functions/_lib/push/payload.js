export const ANDROID_CHANNEL_ID = "severe-alerts";

function short(text, max) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function alertNotification(feature) {
  const p = feature?.properties || {};
  const event = p.event || "Weather warning";
  const area = short(p.areaDesc, 90);
  const until = Date.parse(p.ends || p.expires || "");
  const instruction = /tornado/i.test(event)
    ? "Take shelter now."
    : /flash flood/i.test(event)
      ? "Move to higher ground now."
      : "Move indoors, away from windows.";
  return {
    title: `${event}`,
    body: short(`${area ? `${area}. ` : ""}${instruction} Tap for radar and I'm Safe / I Need Help.`, 220),
    alertId: String(p.id || feature?.id || ""),
    expiresAt: Number.isFinite(until) ? Math.floor(until / 1000) : null,
  };
}

export function buildApnsPayload(feature) {
  const n = alertNotification(feature);
  return {
    aps: {
      alert: { title: n.title, body: n.body },
      sound: "default",
      "interruption-level": "time-sensitive",
      "thread-id": "nws-warnings",
    },
    alertId: n.alertId,
    route: "/Radar",
  };
}

export function buildFcmMessage(token, feature) {
  const n = alertNotification(feature);
  const ttlSeconds = n.expiresAt ? Math.max(60, n.expiresAt - Math.floor(Date.now() / 1000)) : 3600;
  return {
    message: {
      token,
      notification: { title: n.title, body: n.body },
      data: { alertId: n.alertId, route: "/Radar" },
      android: {
        priority: "HIGH",
        ttl: `${ttlSeconds}s`,
        notification: { channel_id: ANDROID_CHANNEL_ID, tag: n.alertId.slice(-60), default_sound: true },
      },
    },
  };
}
