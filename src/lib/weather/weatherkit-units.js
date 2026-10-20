export function isUsCustomary(units) {
  if (!units) return false;
  const normalized = String(units).toLowerCase();
  return normalized === "s" || normalized === "us" || normalized === "imperial";
}

export function celsiusToFahrenheit(value) {
  if (!Number.isFinite(Number(value))) return value;
  return Number(value) * 1.8 + 32;
}

export function kmhToMph(value) {
  if (!Number.isFinite(Number(value))) return value;
  return Number(value) * 0.621371;
}

export function convertTemperature(value, units) {
  return isUsCustomary(units) ? value : celsiusToFahrenheit(value);
}

export function convertWindSpeed(value, units) {
  return isUsCustomary(units) ? value : kmhToMph(value);
}

export function weatherKitUnitsFrom(data) {
  return (
    data?.currentWeather?.metadata?.units ||
    data?.forecastHourly?.metadata?.units ||
    data?.forecastDaily?.metadata?.units ||
    "m"
  );
}
