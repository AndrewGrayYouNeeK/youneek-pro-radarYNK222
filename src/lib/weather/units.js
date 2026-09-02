export const DEFAULT_UNITS = {
  temp: "F",
  wind: "mph",
  pressure: "mb",
  precip: "in",
};

export const UNIT_OPTIONS = {
  temp: [
    { value: "F", label: "Fahrenheit (°F)" },
    { value: "C", label: "Celsius (°C)" },
  ],
  wind: [
    { value: "mph", label: "Miles per hour" },
    { value: "kph", label: "Kilometers per hour" },
    { value: "kts", label: "Knots" },
    { value: "mps", label: "Meters per second" },
  ],
  pressure: [
    { value: "mb", label: "Millibars" },
    { value: "inHg", label: "Inches of mercury" },
  ],
  precip: [
    { value: "in", label: "Inches" },
    { value: "mm", label: "Millimeters" },
  ],
};

export function convertTempF(value, unit) {
  if (!Number.isFinite(Number(value))) return null;
  const f = Number(value);
  return unit === "C" ? (f - 32) * (5 / 9) : f;
}

export function convertWindMph(value, unit) {
  if (!Number.isFinite(Number(value))) return null;
  const mph = Number(value);
  if (unit === "kph") return mph * 1.60934;
  if (unit === "kts") return mph * 0.868976;
  if (unit === "mps") return mph * 0.44704;
  return mph;
}

export function convertPressureMb(value, unit) {
  if (!Number.isFinite(Number(value))) return null;
  const mb = Number(value);
  return unit === "inHg" ? mb / 33.8639 : mb;
}

export function convertPrecipIn(value, unit) {
  if (!Number.isFinite(Number(value))) return null;
  const inches = Number(value);
  return unit === "mm" ? inches * 25.4 : inches;
}

export function formatNumber(value, digits = 0) {
  if (!Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatTemp(valueF, unit = "F") {
  const next = convertTempF(valueF, unit);
  return next == null ? "—" : `${Math.round(next)}°`;
}

export function formatWind(valueMph, unit = "mph") {
  const next = convertWindMph(valueMph, unit);
  if (next == null) return "—";
  const digits = unit === "mps" ? 1 : 0;
  return `${formatNumber(next, digits)} ${windSuffix(unit)}`;
}

export function formatPressure(valueMb, unit = "mb") {
  const next = convertPressureMb(valueMb, unit);
  if (next == null) return "—";
  return `${formatNumber(next, unit === "inHg" ? 2 : 0)} ${pressureSuffix(unit)}`;
}

export function formatPrecip(valueIn, unit = "in") {
  const next = convertPrecipIn(valueIn, unit);
  if (next == null) return "—";
  return `${formatNumber(next, unit === "mm" ? 1 : 2)} ${precipSuffix(unit)}`;
}

export function tempSuffix(unit = "F") {
  return unit === "C" ? "C" : "F";
}

export function windSuffix(unit = "mph") {
  return { mph: "mph", kph: "km/h", kts: "kt", mps: "m/s" }[unit] || "mph";
}

export function pressureSuffix(unit = "mb") {
  return unit === "inHg" ? "inHg" : "mb";
}

export function precipSuffix(unit = "in") {
  return unit === "mm" ? "mm" : "in";
}
