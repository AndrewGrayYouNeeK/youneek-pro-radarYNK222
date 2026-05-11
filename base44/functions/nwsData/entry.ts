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

    // 4) Geocode US locations (city, zip, address) via U.S. Census — no key required
    if (action === 'geocode') {
      const q = String(getParam('q') || '').trim();
      if (!q) return Response.json({ error: 'q required' }, { status: 400 });

      // Try ZIP code first
      const zipMatch = q.match(/^\d{5}$/);
      if (zipMatch) {
        const zr = await fetch(`https://api.zippopotam.us/us/${q}`);
        if (zr.ok) {
          const zd = await zr.json();
          const place = zd.places?.[0];
          if (place) {
            return Response.json({
              results: [{
                label: `${place['place name']}, ${place['state abbreviation']} ${q}`,
                city: place['place name'],
                state: place['state abbreviation'],
                lat: parseFloat(place.latitude),
                lon: parseFloat(place.longitude),
              }],
            });
          }
        }
      }

      const US_STATES = {
        Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',Colorado:'CO',
        Connecticut:'CT',Delaware:'DE','District of Columbia':'DC',Florida:'FL',Georgia:'GA',
        Hawaii:'HI',Idaho:'ID',Illinois:'IL',Indiana:'IN',Iowa:'IA',Kansas:'KS',Kentucky:'KY',
        Louisiana:'LA',Maine:'ME',Maryland:'MD',Massachusetts:'MA',Michigan:'MI',Minnesota:'MN',
        Mississippi:'MS',Missouri:'MO',Montana:'MT',Nebraska:'NE',Nevada:'NV','New Hampshire':'NH',
        'New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND',
        Ohio:'OH',Oklahoma:'OK',Oregon:'OR',Pennsylvania:'PA','Rhode Island':'RI','South Carolina':'SC',
        'South Dakota':'SD',Tennessee:'TN',Texas:'TX',Utah:'UT',Vermont:'VT',Virginia:'VA',
        Washington:'WA','West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY','Puerto Rico':'PR',
      };
      const toCode = (s) => {
        if (!s) return s;
        if (s.length === 2) return s.toUpperCase();
        return US_STATES[s] || s;
      };

      // Open-Meteo geocoder — best for city + state queries
      const cityOnly = q.split(',')[0].trim();
      const om = new URL('https://geocoding-api.open-meteo.com/v1/search');
      om.searchParams.set('name', cityOnly);
      om.searchParams.set('count', '10');
      const omr = await fetch(om.toString());
      if (omr.ok) {
        const omd = await omr.json();
        let results = (omd.results || [])
          .filter((r) => r.country_code === 'US')
          .map((r) => {
            const code = toCode(r.admin1_code || r.admin1);
            return {
              label: `${r.name}${code ? ', ' + code : ''}`,
              city: r.name,
              state: code,
              lat: r.latitude,
              lon: r.longitude,
            };
          });
        // If user typed "City, ST", prefer matches in that state
        const stMatch = q.match(/,\s*([A-Za-z]{2})\s*$/);
        if (stMatch) {
          const st = stMatch[1].toUpperCase();
          const filtered = results.filter((r) => (r.state || '').toUpperCase() === st);
          if (filtered.length) results = filtered;
        }
        if (results.length) return Response.json({ results: results.slice(0, 5) });
      }

      // Fallback: Census street-address geocoder
      const cu = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');
      cu.searchParams.set('address', q);
      cu.searchParams.set('benchmark', 'Public_AR_Current');
      cu.searchParams.set('format', 'json');
      const cr = await fetch(cu.toString());
      if (cr.ok) {
        const cd = await cr.json();
        const matches = (cd.result?.addressMatches || []).slice(0, 5).map((m) => ({
          label: m.matchedAddress,
          city: m.addressComponents?.city,
          state: m.addressComponents?.state,
          lat: m.coordinates?.y,
          lon: m.coordinates?.x,
        }));
        if (matches.length) return Response.json({ results: matches });
      }

      return Response.json({ results: [] });
    }

    // 5) Real storm cells near a lat/lon — NEXRAD Level III storm attributes
    //    Source: Iowa State Mesonet GeoJSON for the "nexrad_attr" layer (public, no key)
    if (action === 'cells') {
      const lat = parseFloat(getParam('lat'));
      const lon = parseFloat(getParam('lon'));
      if (isNaN(lat) || isNaN(lon)) {
        return Response.json({ error: 'lat and lon required' }, { status: 400 });
      }

      // Pull all current NEXRAD storm attributes (CONUS) — refreshes every volume scan (~5 min)
      const url = 'https://mesonet.agron.iastate.edu/geojson/nexrad_attr.geojson';
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) return Response.json({ cells: [], error: `cells ${r.status}` });
      const data = await r.json();

      // Compute distance + bearing from user, sort by distance, return top 10 within 150 miles
      const toRad = (d) => (d * Math.PI) / 180;
      const toDeg = (r) => (r * 180) / Math.PI;
      const haversineMi = (lat1, lon1, lat2, lon2) => {
        const R = 3958.8;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
      };
      const bearing = (lat1, lon1, lat2, lon2) => {
        const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
        const x =
          Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
          Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
        return (toDeg(Math.atan2(y, x)) + 360) % 360;
      };
      const cardinal = (deg) => {
        const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return dirs[Math.round(deg / 22.5) % 16];
      };

      const cells = (data.features || [])
        .filter((f) => f.geometry?.type === 'Point')
        .map((f) => {
          const [cLon, cLat] = f.geometry.coordinates;
          const p = f.properties || {};
          const dist = haversineMi(lat, lon, cLat, cLon);
          const bear = bearing(lat, lon, cLat, cLon);
          return {
            lat: cLat,
            lon: cLon,
            distanceMi: dist,
            bearing: bear,
            bearingCardinal: cardinal(bear),
            // Storm motion: heading degrees + speed in knots from NEXRAD attributes
            stormHeading: p.drct ?? null,
            stormSpeedKt: p.sknt ?? null,
            // Max reflectivity (dBZ) — peak intensity in the cell
            dbz: p.max_dbz ?? null,
            // Hail / tornado / mesocyclone indicators (NEXRAD product)
            tvs: p.tvs || null,        // Tornadic Vortex Signature
            meso: p.meso || null,      // Mesocyclone
            hailProb: p.poh ?? null,   // Probability of hail (%)
            severeHailProb: p.posh ?? null, // Probability of severe hail (%)
            maxHailIn: p.max_size ?? null,  // Max hail size (in)
            radarSite: p.nexrad || null,
          };
        })
        .filter((c) => c.distanceMi <= 150)
        .sort((a, b) => a.distanceMi - b.distanceMi)
        .slice(0, 10);

      return Response.json({ count: cells.length, cells });
    }

    return Response.json({ error: 'unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});