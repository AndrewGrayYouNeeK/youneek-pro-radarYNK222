function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scoreFromIdeal(value, ideal, spread) {
  if (!Number.isFinite(value)) return 50;
  return clamp(100 - (Math.abs(value - ideal) / spread) * 100, 0, 100);
}

export function outdoorScores(current = {}, environment = {}) {
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m ?? 0;
  const precip = current.precipitation_intensity ?? 0;
  const uv = current.uv_index ?? environment.uv ?? 0;
  const aqi = environment.aqi ?? 40;
  const clouds = current.cloud_cover ?? 40;

  const dry = precip < 0.02;
  const airOk = aqi < 100;

  const running = Math.round(
    (scoreFromIdeal(temp, 55, 22) * 0.45 +
      scoreFromIdeal(wind, 6, 18) * 0.2 +
      (dry ? 100 : 20) * 0.2 +
      (airOk ? 100 : 40) * 0.15)
  );
  const golf = Math.round(
    (scoreFromIdeal(temp, 72, 18) * 0.4 +
      scoreFromIdeal(wind, 8, 16) * 0.25 +
      (dry ? 100 : 10) * 0.25 +
      scoreFromIdeal(uv, 5, 6) * 0.1)
  );
  const hiking = Math.round(
    (scoreFromIdeal(temp, 62, 20) * 0.35 +
      (dry ? 100 : 25) * 0.25 +
      (airOk ? 100 : 35) * 0.2 +
      scoreFromIdeal(uv, 4, 6) * 0.2)
  );
  const cycling = Math.round(
    (scoreFromIdeal(temp, 64, 20) * 0.35 +
      scoreFromIdeal(wind, 8, 20) * 0.25 +
      (dry ? 100 : 15) * 0.25 +
      (airOk ? 100 : 40) * 0.15)
  );
  const fishing = Math.round(
    (scoreFromIdeal(temp, 68, 20) * 0.3 +
      scoreFromIdeal(clouds, 55, 40) * 0.25 +
      scoreFromIdeal(wind, 7, 16) * 0.25 +
      (precip < 0.08 ? 80 : 40) * 0.2)
  );

  return [
    { id: "running", label: "Running", score: running },
    { id: "golf", label: "Golf", score: golf },
    { id: "hiking", label: "Hiking", score: hiking },
    { id: "cycling", label: "Cycling", score: cycling },
    { id: "fishing", label: "Fishing", score: fishing },
  ];
}

export function coldFluRisk(current = {}, environment = {}) {
  const temp = current.temperature_2m ?? 60;
  const humidity = current.relative_humidity_2m ?? 50;
  const wind = current.wind_speed_10m ?? 0;
  const aqi = environment.aqi ?? 40;

  let risk = 20;
  if (temp < 45) risk += 25;
  else if (temp < 55) risk += 12;
  if (humidity < 30) risk += 20;
  else if (humidity < 40) risk += 10;
  if (wind > 18) risk += 15;
  if (aqi >= 100) risk += 15;
  risk = clamp(risk, 8, 95);

  const label = risk >= 70 ? "High" : risk >= 45 ? "Moderate" : "Low";
  return { score: Math.round(risk), label };
}

export function scoreLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Fair";
  return "Poor";
}

export function aqiCategory(aqi) {
  if (!Number.isFinite(aqi)) return { label: "Unknown", color: "slate" };
  if (aqi <= 50) return { label: "Good", color: "emerald" };
  if (aqi <= 100) return { label: "Moderate", color: "amber" };
  if (aqi <= 150) return { label: "Unhealthy for sensitive", color: "orange" };
  if (aqi <= 200) return { label: "Unhealthy", color: "red" };
  if (aqi <= 300) return { label: "Very unhealthy", color: "purple" };
  return { label: "Hazardous", color: "rose" };
}

export function uvCategory(uv) {
  if (!Number.isFinite(uv)) return { label: "Unknown", advice: "—" };
  if (uv < 3) return { label: "Low", advice: "Sunglasses optional." };
  if (uv < 6) return { label: "Moderate", advice: "SPF 30 if you will be outside long." };
  if (uv < 8) return { label: "High", advice: "SPF 30+, hat, and shade around midday." };
  if (uv < 11) return { label: "Very high", advice: "Limit midday sun. Cover up." };
  return { label: "Extreme", advice: "Avoid midday sun. Full protection." };
}

export function pollenCategory(value) {
  if (!Number.isFinite(value)) return { label: "n/a", color: "slate" };
  if (value < 5) return { label: "Low", color: "emerald" };
  if (value < 20) return { label: "Moderate", color: "amber" };
  if (value < 50) return { label: "High", color: "orange" };
  return { label: "Very high", color: "red" };
}
