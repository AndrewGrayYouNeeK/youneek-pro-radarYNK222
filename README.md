# YouNeeK Pro Radar

Live weather and radar app. Slogan: **MAKING IT RAIN**. This repository is only the weather app. The marketing site is [https://youneekproradar.com](https://youneekproradar.com), served by the youneekproradarBABY Worker.

- **`/`** opens **`/Radar`** (also `/app`) — NEXRAD, velocity, global + future radar, lightning, tropical cyclones, wildfires, and the customizable pro desk
- **`/Radio`** — NOAA Weather Radio for the nearest station
- **`/Forecast`** — current / hourly / daily from Apple WeatherKit when auth works, otherwise Open-Meteo, plus NWS alerts, AQI, pollen, UV, storm risk, winter, and history
- **`/Globe`** — 3D globe with live and future weather radar, lightning, hurricanes, and wildfires
- **`/More`** — air quality, pollen, lightning, cameras, wildfires, health, news, sun & moon, safety contacts
- **`/Hurricanes`**, **`/Fires`**, **`/Briefing`** — storm and fire centers
- **`/Contacts`** and **`/Settings`** — emergency SMS drafts, units, notification prefs, and WeatherKit auth status

## Local Development

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/AndrewGrayYouNeeK/youneek-pro-radarYNK222.git
cd youneek-pro-radarYNK222
npm install
npm run dev
```

**Weather app:** [https://youneek-pro-radarynk222.youneekartifacts.workers.dev](https://youneek-pro-radarynk222.youneekartifacts.workers.dev)

Open [http://localhost:5173](http://localhost:5173). The first screen is the radar. Allow location when the browser asks.

To share the local app on the public internet (no Cloudflare login):

```bash
npm run tunnel
```

That starts the app on port **8000** and prints a `https://*.trycloudflare.com` URL. See [TUNNEL.md](./TUNNEL.md).

WeatherKit forecasts need Apple credentials in `.env` — copy `.env.example` and follow [WEATHERKIT.md](./WEATHERKIT.md). Radar, NWS alerts, and NOAA radio work without them. If the key is missing or Apple rejects it, Forecast stays on Open-Meteo and NWS.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + local NWS / alerts / WeatherKit / lightning proxies |
| `npm run tunnel` | App on port 8000 plus a public Cloudflare Quick Tunnel URL |
| `npm run dev:tunnel` | Same as `dev`, bound to `http://localhost:8000` (no public URL) |
| `npm run build` | Production build of the weather app (`dist/`) |
| `npm run test` | Unit tests (desk, alerts, safety, WeatherKit auth) |
| `npm run preview` | Preview production build (includes API proxies) |
| `npm run preview:tunnel` | Preview on port 8000 for Cloudflare Tunnel |
| `npm run deploy` / `deploy:weather` | Deploy the weather Worker (`youneek-pro-radarynk222`). Does not change DNS. |
| `npm run lint` | Run ESLint |

## Data Sources

- [Apple WeatherKit](https://developer.apple.com/weatherkit/) — current, hourly, daily, minute precipitation, and alerts when `/api/weather-status` reports `auth: "ok"`
- [Open-Meteo](https://open-meteo.com/) — forecast fallback, geocoding, air quality, pollen, UV
- [NOAA National Weather Service API](https://www.weather.gov/documentation/services-web-api) — alerts, point alerts, headlines
- [Iowa State Mesonet](https://mesonet.agron.iastate.edu/) — NEXRAD mosaics and recent storm reports used for lightning proximity
- [RainViewer](https://www.rainviewer.com/api.html) — global radar, future nowcast, and 3D globe overlay
- [NASA EONET](https://eonet.gsfc.nasa.gov/) and FIRMS — wildfire events and detections
- [NHC](https://www.nhc.noaa.gov/) — active tropical cyclones

## Where features came from

Location alerts, the customizable radar desk, NOAA radio, contacts, and safety texts came from **youneekproradarBABY** and live on this app's pages. The marketing site stays on that other Worker at youneekproradar.com.
