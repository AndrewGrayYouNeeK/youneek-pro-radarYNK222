export const UNIT_DEFAULTS = {
  temp: "F",
  wind: "mph",
  pressure: "inhg",
  precip: "in",
  distance: "mi",
};

const STORAGE_KEY = "ynk_units_v1";

export function loadUnits() {
  if (typeof window === "undefined") return { ...UNIT_DEFAULTS };
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...UNIT_DEFAULTS, ...stored };
  } catch {
    return { ...UNIT_DEFAULTS };
  }
}

export function saveUnits(units) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
}

export function fToDisplay(f, units) {
  if (!Number.isFinite(f)) return null;
  return units.temp === "C" ? ((f - 32) * 5) / 9 : f;
}

export function formatTemp(f, units, { digits = 0, withUnit = true } = {}) {
  const value = fToDisplay(f, units);
  if (value == null) return "—";
  const rounded = digits ? value.toFixed(digits) : String(Math.round(value));
  return withUnit ? `${rounded}°${units.temp === "C" ? "C" : "F"}` : `${rounded}°`;
}

export function formatTempShort(f, units) {
  return formatTemp(f, units, { withUnit: false });
}

const WIND_FROM_MPH = {
  mph: 1,
  kph: 1.60934,
  knots: 0.868976,
  mps: 0.44704,
};

const WIND_LABEL = {
  mph: "mph",
  kph: "km/h",
  knots: "kt",
  mps: "m/s",
};

export function formatWind(mph, units, { digits = 0 } = {}) {
  if (!Number.isFinite(mph)) return "—";
  const factor = WIND_FROM_MPH[units.wind] || 1;
  const value = mph * factor;
  const rounded = digits ? value.toFixed(digits) : String(Math.round(value));
  return `${rounded} ${WIND_LABEL[units.wind] || "mph"}`;
}

export function mbToInHg(mb) {
  if (!Number.isFinite(mb)) return null;
  return mb * 0.02953;
}

export function formatPressure(mb, units) {
  if (!Number.isFinite(mb)) return "—";
  if (units.pressure === "mb") return `${Math.round(mb)} mb`;
  return `${mbToInHg(mb).toFixed(2)} in`;
}

export function formatPrecip(inches, units, { digits = 2, suffix = "" } = {}) {
  if (!Number.isFinite(inches)) return "—";
  if (units.precip === "mm") {
    return `${(inches * 25.4).toFixed(digits)} mm${suffix}`;
  }
  return `${inches.toFixed(digits)} in${suffix}`;
}

export function formatDistance(miles, units, { digits = 1 } = {}) {
  if (!Number.isFinite(miles)) return "—";
  if (units.distance === "km") return `${(miles * 1.60934).toFixed(digits)} km`;
  return `${miles.toFixed(digits)} mi`;
}

export function formatVisibility(miles, units) {
  if (!Number.isFinite(miles)) return "—";
  if (units.distance === "km") return `${(miles * 1.60934).toFixed(1)} km`;
  return `${Math.round(miles)} mi`;
}

export const UNIT_OPTIONS = {
  temp: [
    { value: "F", label: "Fahrenheit (°F)" },
    { value: "C", label: "Celsius (°C)" },
  ],
  wind: [
    { value: "mph", label: "Miles per hour" },
    { value: "kph", label: "Kilometers per hour" },
    { value: "knots", label: "Knots" },
    { value: "mps", label: "Meters per second" },
  ],
  pressure: [
    { value: "inhg", label: "Inches of mercury" },
    { value: "mb", label: "Millibars" },
  ],
  precip: [
    { value: "in", label: "Inches" },
    { value: "mm", label: "Millimeters" },
  ],
  distance: [
    { value: "mi", label: "Miles" },
    { value: "km", label: "Kilometers" },
  ],
};
