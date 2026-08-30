# YouNeeK Pro Radar

Cinematic landing site **and** live radar product in one app. Slogan: **MAKING IT RAIN**.

- **`/`** — storm landing (GPS location, neon signs, NWS conditions, SOS)
- **`/Radar`** (also `/app`) — NEXRAD, global + future radar, lightning, tropical cyclones, wildfires
- **`/Forecast`** — current / hourly (168h) / 16-day, AQI, pollen, storm risk, winter, history
- **`/Globe`** — 3D globe with live and future weather radar
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

Open [http://localhost:5173](http://localhost:5173). Allow location when the browser asks, then Launch Radar.

WeatherKit forecasts need Apple credentials in `.env` — copy `.env.example` and follow [WEATHERKIT.md](./WEATHERKIT.md). Radar, NWS alerts, and NOAA radio work without them.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + local NWS / alerts / WeatherKit / lightning proxies |
| `npm run build` | Production build |
| `npm run preview` | Preview production build (includes API proxies) |
| `npm run deploy` | Cloudflare Worker deploy (`wrangler.toml`) |
| `npm run lint` | Run ESLint |

## Data Sources

- [NOAA National Weather Service API](https://www.weather.gov/documentation/services-web-api) — alerts, forecasts, observations
- [Iowa State Mesonet](https://mesonet.agron.iastate.edu/) — NEXRAD mosaics and storm attributes
- [Apple WeatherKit](https://developer.apple.com/weatherkit/) — Forecast tab (optional)
- [Open-Meteo Geocoding](https://open-meteo.com/) — location search

## Merged from

This repo is the **youneek-pro-radarYNK222** landing plus the **youneekproradarBABY** radar/WeatherKit app.
