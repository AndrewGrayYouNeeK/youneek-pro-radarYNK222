# YouNeeK Pro Radar

Cinematic landing site for **YouNeeK Pro Radar**. Slogan: **MAKING IT RAIN**.

The live weather app (NOW / Hourly / 10 Day / Maps) is **[youneekproradar.com](https://youneekproradar.com)**. Landing **Launch** opens that site.

- **`/`** — storm landing (GPS location, neon signs, live conditions, SOS)
- **Launch / `/app` / `/Radar` / `/Forecast`** — [youneekproradar.com](https://youneekproradar.com) (`youneekproradarbaby`)

## Local Development

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/AndrewGrayYouNeeK/youneek-pro-radarYNK222.git
cd youneek-pro-radarYNK222
npm install
npm run dev
```

**Landing:** [https://youneek-pro-radarynk222.youneekartifacts.workers.dev](https://youneek-pro-radarynk222.youneekartifacts.workers.dev)

**Weather app:** [https://youneekproradar.com](https://youneekproradar.com)

Open [http://localhost:5173](http://localhost:5173) locally. Allow location when the browser asks, then Launch Radar.

To share the local app on the public internet (no Cloudflare login):

```bash
npm run tunnel
```

That starts the app on port **8000** and prints a `https://*.trycloudflare.com` URL. See [TUNNEL.md](./TUNNEL.md).

WeatherKit forecasts need Apple credentials in `.env` — copy `.env.example` and follow [WEATHERKIT.md](./WEATHERKIT.md). Radar, NWS alerts, and NOAA radio work without them.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + local NWS / alerts / WeatherKit / lightning proxies |
| `npm run tunnel` | App on port 8000 plus a public Cloudflare Quick Tunnel URL |
| `npm run dev:tunnel` | Same as `dev`, bound to `http://localhost:8000` (no public URL) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build (includes API proxies) |
| `npm run preview:tunnel` | Preview on port 8000 for Cloudflare Tunnel |
| `npm run deploy` | Cloudflare Worker deploy (`wrangler.toml`) |
| `npm run lint` | Run ESLint |

## Data Sources

- [NOAA National Weather Service API](https://www.weather.gov/documentation/services-web-api) — alerts, forecasts, observations
- [Iowa State Mesonet](https://mesonet.agron.iastate.edu/) — NEXRAD mosaics and storm attributes
- [Apple WeatherKit](https://developer.apple.com/weatherkit/) — Forecast tab when credentials are set
- [Open-Meteo](https://open-meteo.com/) — forecast fallback, geocoding, air quality, pollen, UV
- [RainViewer](https://www.rainviewer.com/api.html) — global radar, future nowcast, and 3D globe overlay
- [NASA EONET](https://eonet.gsfc.nasa.gov/) — wildfire events

## Merged from

This repo is the **youneek-pro-radarYNK222** landing plus the **youneekproradarBABY** radar/WeatherKit app.
