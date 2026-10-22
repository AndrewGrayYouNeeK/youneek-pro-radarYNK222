export function localDayKey(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function forecastDayKey(value) {
  const match = String(value || "").match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

export function filterUpcomingDays(days = [], now = new Date()) {
  const today = localDayKey(now);
  return (days || []).filter((day) => {
    const key = forecastDayKey(day?.date || day?.forecastStart);
    return Boolean(key) && key >= today;
  });
}
