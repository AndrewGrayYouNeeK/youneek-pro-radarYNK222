import { openExternalUrl, shareSafetyMessage } from "../native/openExternal.js";
import { isNativePlatform } from "../native/runtime.js";

export const SHELTER_CONTACTS_EVENT = "ynk-shelter-contacts";
export const SAFETY_EXPLAINED_KEY = "safetySmsExplained_v1";
export const SAFETY_MESSAGES_KEY = "safetyMessages_v1";
export const MAX_SHELTER_CONTACTS = 5;
export const DEFAULT_EMERGENCY_LINE = "EMERGENCY — I need help. I am taking shelter now.";
export const DEFAULT_SAFE_LINE = "I’M SHELTERING — I am sheltering and I am safe.";
const APP_SIGNATURE = "Sent from YouNeeK Pro Radar";

function storageFor(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function normalizeUsPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function loadShelterContacts(storage) {
  const store = storageFor(storage);
  if (!store) return [];
  try {
    const v2 = JSON.parse(store.getItem("shelterContacts_v2") || "null");
    if (Array.isArray(v2) && v2.length > 0 && v2[0]?.phone) return v2;
    const legacy = JSON.parse(store.getItem("shelterContacts") || "[]");
    if (!Array.isArray(legacy)) return [];
    return legacy.map((phone, index) => ({ id: String(index), name: `Contact ${index + 1}`, phone }));
  } catch {
    return [];
  }
}

export function saveShelterContacts(contacts, storage) {
  const list = (Array.isArray(contacts) ? contacts : []).slice(0, MAX_SHELTER_CONTACTS);
  const store = storageFor(storage);
  try {
    store?.setItem("shelterContacts_v2", JSON.stringify(list));
    store?.setItem(
      "shelterContacts",
      JSON.stringify(list.map((contact) => contact.phone).filter(Boolean))
    );
  } catch {
    /* ignore quota / private mode */
  }
  if (!storage && typeof window !== "undefined") {
    window.dispatchEvent(new Event(SHELTER_CONTACTS_EVENT));
  }
  return list;
}

export function addShelterContact({ name, phone, id } = {}, storage) {
  const trimName = String(name || "").trim();
  const cleaned = normalizeUsPhone(phone);
  if (!trimName) {
    const error = new Error("Enter a name.");
    error.code = "NAME";
    throw error;
  }
  if (!cleaned) {
    const error = new Error("Enter a valid 10-digit US number.");
    error.code = "PHONE";
    throw error;
  }
  const current = loadShelterContacts(storage);
  if (current.some((contact) => contact.phone === cleaned)) {
    const error = new Error("That number is already saved.");
    error.code = "DUPLICATE";
    throw error;
  }
  if (current.length >= MAX_SHELTER_CONTACTS) {
    const error = new Error("Max 5 shelter contacts.");
    error.code = "LIMIT";
    throw error;
  }
  return saveShelterContacts(
    [...current, { id: id || String(Date.now()), name: trimName, phone: cleaned }],
    storage
  );
}

export function uniqueContactPhones(contacts) {
  return [...new Set((contacts || []).map((contact) => contact.phone).filter(Boolean))];
}

export function loadSafetyMessages(storage) {
  const fallback = { emergency: DEFAULT_EMERGENCY_LINE, safe: DEFAULT_SAFE_LINE };
  const store = storageFor(storage);
  if (!store) return fallback;
  try {
    const parsed = JSON.parse(store.getItem(SAFETY_MESSAGES_KEY) || "null");
    const emergency = String(parsed?.emergency || "").trim();
    const safe = String(parsed?.safe || "").trim();
    return {
      emergency: emergency || DEFAULT_EMERGENCY_LINE,
      safe: safe || DEFAULT_SAFE_LINE,
    };
  } catch {
    return fallback;
  }
}

export function saveSafetyMessages(messages = {}, storage) {
  const next = {
    emergency: String(messages.emergency || "").trim() || DEFAULT_EMERGENCY_LINE,
    safe: String(messages.safe || "").trim() || DEFAULT_SAFE_LINE,
  };
  const store = storageFor(storage);
  try {
    store?.setItem(SAFETY_MESSAGES_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
  return next;
}

export function buildSmsUrl(phone, body, userAgent) {
  const ua = userAgent ?? (typeof navigator === "undefined" ? "" : navigator.userAgent || "");
  const separator = /iPad|iPhone|iPod/.test(ua) ? "&" : "?";
  return `sms:${phone}${separator}body=${encodeURIComponent(body)}`;
}

export function buildGroupSmsUrl(phones, body, userAgent) {
  const list = (phones || []).filter(Boolean).join(",");
  return buildSmsUrl(list, body, userAgent);
}

export function deviceCanComposeSms(env = {}) {
  const ua = env.userAgent ?? (typeof navigator === "undefined" ? "" : navigator.userAgent || "");
  const platform = env.platform ?? (typeof navigator === "undefined" ? "" : navigator.platform || "");
  const touch = env.maxTouchPoints ?? (typeof navigator === "undefined" ? 0 : navigator.maxTouchPoints || 0);
  if (/iPad/.test(ua)) return false;
  if (platform === "MacIntel" && touch > 1 && !/iPhone/.test(ua)) return false;
  return true;
}

export function formatSafetyLocationLine(coords) {
  const lat = Number(coords?.latitude);
  const lon = Number(coords?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "";
  const latText = lat.toFixed(5);
  const lonText = lon.toFixed(5);
  return [
    `My location: ${latText}, ${lonText}`,
    `https://maps.apple.com/?ll=${latText},${lonText}&q=${latText},${lonText}`,
    `https://maps.google.com/?q=${latText},${lonText}`,
  ].join("\n");
}

export function safetyMessageExplanation() {
  return "This opens one message draft to the contacts you saved on this device. I’m Sheltering says you are sheltering and safe, and the draft includes your exact coordinates and a Google Maps link. Nothing is sent until you tap Send. The app does not text anyone by itself and does not resend.";
}

export function buildEmergencyBody({ locationLine, message, storage } = {}) {
  const line = String(message ?? loadSafetyMessages(storage).emergency).trim() || DEFAULT_EMERGENCY_LINE;
  return [line, locationLine, APP_SIGNATURE].filter(Boolean).join("\n");
}

export function buildImSafeBody({ locationLine, context, message, storage } = {}) {
  const line = String(message ?? context ?? loadSafetyMessages(storage).safe).trim() || DEFAULT_SAFE_LINE;
  return [line, locationLine, APP_SIGNATURE].filter(Boolean).join("\n");
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

function locationLineFromCoords(coords) {
  return formatSafetyLocationLine(coords);
}

function cancelledShare(error) {
  return /cancel/i.test(String(error?.message || error || ""));
}

export async function sendContactTexts({ kind, context, coords, storage } = {}) {
  const contacts = loadShelterContacts(storage);
  const phones = uniqueContactPhones(contacts);
  if (!phones.length) {
    const error = new Error("Add at least one shelter contact first.");
    error.code = "NO_CONTACTS";
    throw error;
  }

  const knownLine = locationLineFromCoords(coords);
  const locationLine = knownLine || await new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve("(Location unavailable)");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(formatSafetyLocationLine({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }) || "(Location unavailable)");
      },
      () => resolve("(Location unavailable)"),
      { timeout: 8000 }
    );
  });

  const body =
    kind === "emergency"
      ? buildEmergencyBody({ locationLine, storage })
      : buildImSafeBody({ locationLine, context, storage });

  if (isNativePlatform()) {
    if (!deviceCanComposeSms()) {
      try {
        await shareSafetyMessage(body);
        return { count: phones.length, mode: "share", body };
      } catch (error) {
        if (cancelledShare(error)) {
          const cancelled = new Error("Nothing was sent.");
          cancelled.code = "CANCELLED";
          throw cancelled;
        }
        const unavailable = new Error("This device can't open Messages. Nothing was sent.");
        unavailable.code = "SMS_UNAVAILABLE";
        throw unavailable;
      }
    }
    const opened = openExternalUrl(buildGroupSmsUrl(phones, body));
    if (!opened) {
      const unavailable = new Error("Messages didn't open. Nothing was sent.");
      unavailable.code = "SMS_UNAVAILABLE";
      throw unavailable;
    }
    return { count: phones.length, mode: "sms", body };
  }

  await openSmsDrafts({ phones, body });
  return { count: phones.length, mode: "sms", body };
}
