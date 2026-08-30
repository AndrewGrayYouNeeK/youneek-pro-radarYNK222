function maxFinite(values) {
  const numbers = values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  return numbers.length ? Math.max(...numbers) : null;
}

export async function fetchEnvironment({ latitude, longitude }) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });
  const response = await fetch(`/api/air?${params.toString()}`);
  if (!response.ok) throw new Error("Air quality unavailable");
  const payload = await response.json();
  const current = payload.current || {};
  const pollen = {
    alder: current.alder_pollen ?? null,
    birch: current.birch_pollen ?? null,
    grass: current.grass_pollen ?? null,
    mugwort: current.mugwort_pollen ?? null,
    olive: current.olive_pollen ?? null,
    ragweed: current.ragweed_pollen ?? null,
  };

  return {
    aqi: current.us_aqi ?? null,
    pm25: current.pm2_5 ?? null,
    pm10: current.pm10 ?? null,
    ozone: current.ozone ?? null,
    no2: current.nitrogen_dioxide ?? null,
    co: current.carbon_monoxide ?? null,
    uv: current.uv_index ?? null,
    pollen: maxFinite(Object.values(pollen)),
    pollenBreakdown: pollen,
  };
}
