export async function fetchOpenMeteo(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "uv_index",
      "dew_point_2m",
      "visibility",
      "is_day",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,weather_code,uv_index,precipitation,apparent_temperature"
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_sum",
      "precipitation_probability_max",
      "uv_index_max",
      "wind_speed_10m_max",
    ].join(",")
  );
  url.searchParams.set("minutely_15", "precipitation");
  url.searchParams.set("forecast_days", "14");
  url.searchParams.set("forecast_minutely_15", "8");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Open-Meteo forecast unavailable");
  return response.json();
}

export async function fetchNwsPointAlerts(latitude, longitude) {
  const url = `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`;
  const response = await fetch(url, {
    headers: { Accept: "application/geo+json" },
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.features || []).map((feature) => {
    const properties = feature.properties || {};
    return {
      id: feature.id || properties.id,
      name: properties.event || properties.headline || "Weather alert",
      description: properties.headline || properties.description || "",
      source: "NWS",
      severity: properties.severity || "",
      urgency: properties.urgency || "",
      certainty: properties.certainty || "",
      issued: properties.sent || properties.effective,
      expires: properties.expires || properties.ends,
      url: properties.id,
    };
  });
}
