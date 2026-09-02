export function aqiCategory(value) {
  const aqi = Number(value);
  if (!Number.isFinite(aqi)) return { label: "n/a", tone: "text-slate-400", bar: "bg-slate-600" };
  if (aqi <= 50) return { label: "Good", tone: "text-emerald-300", bar: "bg-emerald-400" };
  if (aqi <= 100) return { label: "Moderate", tone: "text-yellow-300", bar: "bg-yellow-400" };
  if (aqi <= 150) return { label: "Unhealthy for sensitive", tone: "text-orange-300", bar: "bg-orange-400" };
  if (aqi <= 200) return { label: "Unhealthy", tone: "text-red-300", bar: "bg-red-500" };
  if (aqi <= 300) return { label: "Very unhealthy", tone: "text-fuchsia-300", bar: "bg-fuchsia-500" };
  return { label: "Hazardous", tone: "text-rose-200", bar: "bg-rose-600" };
}

export function uvCategory(value) {
  const uv = Number(value);
  if (!Number.isFinite(uv)) return { label: "n/a", tone: "text-slate-400" };
  if (uv < 3) return { label: "Low", tone: "text-emerald-300" };
  if (uv < 6) return { label: "Moderate", tone: "text-yellow-300" };
  if (uv < 8) return { label: "High", tone: "text-orange-300" };
  if (uv < 11) return { label: "Very high", tone: "text-red-300" };
  return { label: "Extreme", tone: "text-fuchsia-300" };
}

export function pollenCategory(value) {
  const grains = Number(value);
  if (!Number.isFinite(grains)) return { label: "n/a", tone: "text-slate-400" };
  if (grains <= 0) return { label: "None", tone: "text-emerald-300" };
  if (grains < 20) return { label: "Low", tone: "text-lime-300" };
  if (grains < 50) return { label: "Moderate", tone: "text-yellow-300" };
  if (grains < 100) return { label: "High", tone: "text-orange-300" };
  return { label: "Very high", tone: "text-red-300" };
}
