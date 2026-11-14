// Screen-spaced weather samples (temperature, AQI, and the other surface
// fields) cover a phone-width national map when they draw on every view.
// Keep them off that zoomed-out radar and only draw once the map is close
// enough that a reading is a label, not a blanket of dots.
export const SAMPLE_MIN_ZOOM = 6;

export function shouldDrawSampleGrid(zoom) {
  return Number.isFinite(zoom) && zoom >= SAMPLE_MIN_ZOOM;
}

export function formatSampleLabel(field, value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const rounded = Math.round(number);
  if (field === "humidity" || field === "clouds") return `${rounded}%`;
  if (field === "uv") return `UV ${rounded}`;
  if (field === "pressure") return `${rounded} mb`;
  if (field === "air") return `AQI ${rounded}`;
  if (field === "feelsLike") return `Feel ${rounded}°`;
  if (field === "dewpoint") return `Dew ${rounded}°`;
  return `${rounded}°`;
}

export function sampleLabelInk(color) {
  const hex = String(color || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#0f172a";
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 160 ? "#0f172a" : "#f8fafc";
}
