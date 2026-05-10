// NOAA / National Weather Service public API proxy
// Docs: https://www.weather.gov/documentation/services-web-api
// No API key required. Requires User-Agent header.

const UA = 'YouNeeKProRadar/1.0 (contact@youneek.app)';

async function nwsFetch(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/geo+json,application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NWS ${res.status} ${url} :: ${text.slice(0, 300)}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    // Accept params via JSON body (preferred) or query string
    let body = {};
    if (req.method !== 'GET') {
      try { body = await req.json(); } catch (_) { body = {}; }
    }
    const url = new URL(req.url);
    const getParam = (k) => body?.[k] ?? url.searchParams.get(k);
    const action = getParam('action') || 'alerts';

    // 1) Active severe alerts (CONUS) — real NWS data
    if (action === 'alerts') {
      const area = getParam('area'); // optional state code e.g. "TX"
      const limit = parseInt(getParam('limit') || '20', 10);
      const params = new URLSearchParams();
      if (area) params.set('area', area);
      const qs = params.toString();
      const data = await nwsFetch(`https://api.weather.gov/alerts/active${qs ? `?${qs}` : ''}`);

      const features = (data.features || []).slice(0, limit).map((f) => ({
        id: f.id,
        event: f.properties?.event,
        severity: f.properties?.severity,
        certainty: f.properties?.certainty,
        urgency: f.properties?.urgency,
        headline: f.properties?.headline,
        areaDesc: f.properties?.areaDesc,
        sent: f.properties?.sent,
        effective: f.properties?.effective,
        expires: f.properties?.expires,
        senderName: f.properties?.senderName,
      }));
      return Response.json({ count: features.length, alerts: features });
    }

    // 2) Current conditions + forecast for a lat/lon
    if (action === 'point') {
      const lat = getParam('lat');
      const lon = getParam('lon');
      if (!lat || !lon) {
        return Response.json({ error: 'lat and lon required' }, { status: 400 });
      }
      const point = await nwsFetch(`https://api.weather.gov/points/${lat},${lon}`);
      const stationsUrl = point.properties?.observationStations;
      const forecastUrl = point.properties?.forecast;
      const forecastHourlyUrl = point.properties?.forecastHourly;

      let observation = null;
      if (stationsUrl) {
        const stations = await nwsFetch(stationsUrl);
        const firstStation = stations.features?.[0]?.properties?.stationIdentifier;
        if (firstStation) {
          try {
            const obs = await nwsFetch(`https://api.weather.gov/stations/${firstStation}/observations/latest`);
            const p = obs.properties || {};
            observation = {
              station: firstStation,
              temperatureC: p.temperature?.value,
              windMps: p.windSpeed?.value,
              windDir: p.windDirection?.value,
              humidity: p.relativeHumidity?.value,
              pressurePa: p.barometricPressure?.value,
              dewpointC: p.dewpoint?.value,
              description: p.textDescription,
              timestamp: p.timestamp,
            };
          } catch (_) { /* skip if station has no recent obs */ }
        }
      }

      let forecast = [];
      if (forecastUrl) {
        const fc = await nwsFetch(forecastUrl);
        forecast = (fc.properties?.periods || []).slice(0, 7).map((p) => ({
          name: p.name,
          temperature: p.temperature,
          temperatureUnit: p.temperatureUnit,
          windSpeed: p.windSpeed,
          windDirection: p.windDirection,
          shortForecast: p.shortForecast,
          icon: p.icon,
        }));
      }

      return Response.json({
        location: {
          city: point.properties?.relativeLocation?.properties?.city,
          state: point.properties?.relativeLocation?.properties?.state,
          gridId: point.properties?.gridId,
          radarStation: point.properties?.radarStation,
        },
        observation,
        forecast,
        forecastHourlyUrl,
      });
    }

    // 3) SPC Day-1 convective outlook (categorical risk)
    if (action === 'spc') {
      const data = await nwsFetch('https://api.weather.gov/products/types/SWODY1');
      const latest = data['@graph']?.[0];
      if (!latest) return Response.json({ outlook: null });
      const product = await nwsFetch(latest['@id']);
      return Response.json({
        issued: product.issuanceTime,
        productCode: product.productCode,
        text: (product.productText || '').slice(0, 4000),
      });
    }

    return Response.json({ error: 'unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});