export function loadShelterContacts() {
  try {
    const v2 = JSON.parse(localStorage.getItem("shelterContacts_v2") || "null");
    if (Array.isArray(v2) && v2.length > 0 && v2[0]?.phone) return v2;
    const legacy = JSON.parse(localStorage.getItem("shelterContacts") || "[]");
    return legacy.map((phone, index) => ({ id: String(index), name: `Contact ${index + 1}`, phone }));
  } catch {
    return [];
  }
}

export function uniqueContactPhones(contacts) {
  return [...new Set((contacts || []).map((contact) => contact.phone).filter(Boolean))];
}

export function buildSmsUrl(phone, body) {
  const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";
  return `sms:${phone}${separator}body=${encodeURIComponent(body)}`;
}

export function buildEmergencyBody({ locationLine }) {
  return [
    "EMERGENCY — I need help. I am taking shelter now.",
    locationLine,
    "Sent from YouNeeK Pro Radar",
  ].join("\n");
}

export function buildImSafeBody({ locationLine, context }) {
  return [
    context || "I'M SAFE — I am OK and accounted for.",
    locationLine,
    "Sent from YouNeeK Pro Radar",
  ].join("\n");
}

export async function openSmsDrafts({ phones, body, onProgress }) {
  for (let index = 0; index < phones.length; index += 1) {
    window.open(buildSmsUrl(phones[index], body), "_blank");
    onProgress?.(index + 1, phones.length);
    if (index < phones.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}

export async function sendContactTexts({ kind, context } = {}) {
  const contacts = loadShelterContacts();
  const phones = uniqueContactPhones(contacts);
  if (!phones.length) {
    throw new Error("Add at least one shelter contact first.");
  }

  const locationLine = await new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("(Location unavailable)");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(`My location: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`);
      },
      () => resolve("(Location unavailable)"),
      { timeout: 8000 }
    );
  });

  const body =
    kind === "emergency"
      ? buildEmergencyBody({ locationLine })
      : buildImSafeBody({ locationLine, context });

  await openSmsDrafts({ phones, body });
  return { count: phones.length };
}
