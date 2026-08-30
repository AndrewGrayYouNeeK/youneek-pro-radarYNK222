export async function fetchEnvironment({ latitude, longitude }) {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "us_aqi",
      "pm2_5",
      "pm10",
      "carbon_monoxide",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "ozone",
      "uv_index",
      "alder_pollen",
      "birch_pollen",
      "grass_pollen",
      "mugwort_pollen",
      "olive_pollen",
      "ragweed_pollen",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    "us_aqi,uv_index,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen"
  );
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Air quality unavailable");
  const payload = await response.json();
  const current = payload.current || {};
  const pollen = {
    alder: current.alder_pollen,
    birch: current.birch_pollen,
    grass: current.grass_pollen,
    mugwort: current.mugwort_pollen,
    olive: current.olive_pollen,
    ragweed: current.ragweed_pollen,
  };
  const pollenValues = Object.values(pollen)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const dominant = Object.entries(pollen)
    .filter(([, value]) => Number.isFinite(Number(value)))
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 3)
    .map(([name, value]) => ({ name, value: Number(value) }));

  return {
    aqi: current.us_aqi ?? null,
    pm25: current.pm2_5 ?? null,
    pm10: current.pm10 ?? null,
    co: current.carbon_monoxide ?? null,
    no2: current.nitrogen_dioxide ?? null,
    so2: current.sulphur_dioxide ?? null,
    o3: current.ozone ?? null,
    uv: current.uv_index ?? null,
    pollen: pollenValues.length ? Math.max(...pollenValues) : null,
    pollenTypes: pollen,
    dominantPollen: dominant,
    hourly: payload.hourly || {},
  };
}
