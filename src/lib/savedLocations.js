const STORAGE_KEY = "ynk_saved_locations_v1";

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(locations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations.slice(0, 12)));
  return locations.slice(0, 12);
}

export function getSavedLocations() {
  return read();
}

export function upsertSavedLocation(location) {
  const id = location.id || `${Number(location.lat).toFixed(3)},${Number(location.lon).toFixed(3)}`;
  const next = [
    {
      id,
      label: location.label || "Saved place",
      city: location.city || "",
      state: location.state || "",
      lat: Number(location.lat),
      lon: Number(location.lon),
    },
    ...read().filter((item) => item.id !== id),
  ];
  return write(next);
}

export function removeSavedLocation(id) {
  return write(read().filter((item) => item.id !== id));
}
