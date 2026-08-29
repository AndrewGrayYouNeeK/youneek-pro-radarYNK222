export async function fetchEnvironment({ latitude, longitude }) {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "us_aqi,pm2_5,uv_index,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen"
  );
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Air quality unavailable");
  const payload = await response.json();
  const current = payload.current || {};
  const pollenValues = [
    current.alder_pollen,
    current.birch_pollen,
    current.grass_pollen,
    current.mugwort_pollen,
    current.olive_pollen,
    current.ragweed_pollen,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  return {
    aqi: current.us_aqi ?? null,
    pm25: current.pm2_5 ?? null,
    uv: current.uv_index ?? null,
    pollen: pollenValues.length ? Math.max(...pollenValues) : null,
  };
}
