# YouNeeK Pro Radar

Live radar product. Slogan: **MAKING IT RAIN**. The marketing landing page is a separate site (`npm run build:landing`).

- **`/`** and **`/Radar`** (also `/app`) — NEXRAD, velocity, global + future radar, lightning, tropical cyclones, wildfires, and the customizable pro desk
- **`/Radio`** — NOAA Weather Radio for the nearest station
- **`/Forecast`** — current / hourly (168h) / 16-day, AQI, pollen, UV, storm risk, winter, history
- **`/Globe`** — 3D globe with live and future weather radar, lightning, hurricanes, and wildfires
- **`/More`** — air quality, pollen, lightning, cameras, wildfires, health, news, sun & moon, safety contacts
- **`/Hurricanes`**, **`/Fires`**, **`/Briefing`** — WeatherBug-class centers, all included
- **`/Contacts`** and **`/Settings`** — emergency SMS drafts, units, and preferences

## Local Development

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/AndrewGrayYouNeeK/youneek-pro-radarYNK222.git
cd youneek-pro-radarYNK222
npm install
npm run dev
```

**Live site:** [https://youneek-pro-radarynk222.youneekartifacts.workers.dev](https://youneek-pro-radarynk222.youneekartifacts.workers.dev)

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
| `npm run build` | Production build of the weather app (`dist/`) |
| `npm run build:landing` | Separate marketing site (`dist-landing/`) |
| `npm run dev:landing` | Preview the landing site locally |
| `npm run test` | Unit tests (desk, alerts, safety, two-site deploy) |
| `npm run preview` | Preview production build (includes API proxies) |
| `npm run preview:tunnel` | Preview on port 8000 for Cloudflare Tunnel |
| `npm run deploy` / `deploy:weather` | Deploy the weather app Worker (`youneek-pro-radarynk222`). Does not change DNS. |
| `npm run deploy:landing` | Deploy the landing site to a separate Worker (`youneek-pro-radar-landing`). Does not attach a custom domain. |
| `npm run lint` | Run ESLint |

## Data Sources

- [NOAA National Weather Service API](https://www.weather.gov/documentation/services-web-api) — alerts, forecasts, observations
- [Iowa State Mesonet](https://mesonet.agron.iastate.edu/) — NEXRAD mosaics and storm attributes
- [Apple WeatherKit](https://developer.apple.com/weatherkit/) — Forecast tab when credentials are set
- [Open-Meteo](https://open-meteo.com/) — forecast fallback, geocoding, air quality, pollen, UV
- [RainViewer](https://www.rainviewer.com/api.html) — global radar, future nowcast, and 3D globe overlay
- [NASA EONET](https://eonet.gsfc.nasa.gov/) — wildfire events

## Merged from

This repo is the complete YouNeeK Pro Radar weather app. The marketing landing page builds separately. Location alerts, the customizable radar desk, NOAA radio, contacts, and safety texts came from **youneekproradarBABY** and sit on YNK222's existing pages.
