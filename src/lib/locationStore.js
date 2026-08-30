const STORAGE_KEY = "ynk_saved_locations_v1";
const ACTIVE_KEY = "ynk_active_location_v1";

export const FALLBACK_LOCATION = {
  latitude: 39.8283,
  longitude: -98.5795,
  label: "United States",
  source: "fallback",
};

export function loadSavedLocations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSavedLocations(locations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations.slice(0, 8)));
}

export function loadActiveLocation() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveActiveLocation(location) {
  if (!location) {
    localStorage.removeItem(ACTIVE_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(location));
}

export async function searchPlaces(query) {
  const name = String(query || "").trim();
  if (name.length < 2) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const response = await fetch(url.toString());
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.results || []).map((place) => ({
    latitude: place.latitude,
    longitude: place.longitude,
    label: [place.name, place.admin1, place.country_code].filter(Boolean).join(", "),
    source: "search",
  }));
}
