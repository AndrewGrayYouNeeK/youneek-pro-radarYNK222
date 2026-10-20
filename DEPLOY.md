# Deploy guide — weather app only

This repository publishes one site: the YouNeeK Pro Radar weather app. The marketing page at [https://youneekproradar.com](https://youneekproradar.com) is the youneekproradarBABY Worker. Do not attach that domain here, and do not rename this Worker.

| Site | Build | Cloudflare Worker | Home |
|---|---|---|---|
| **Weather app** | `npm run build` → `dist/` | **`youneek-pro-radarynk222`** (`wrangler.toml`) | `/` redirects to `/Radar` |
| **Marketing site** | youneekproradarBABY repo, not this one | **`youneekproradarbaby`** | `https://youneekproradar.com` |

WeatherKit secrets belong only on `youneek-pro-radarynk222`.

## Weather app

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

`wrangler.toml` keeps `name = "youneek-pro-radarynk222"` and has no custom domain. Do not add a `youneekproradar.com` route here.

This guide does not deploy anything. When a human is ready: `npm run build && npm run deploy:weather`.

## API routes

| Route | Purpose |
|---|---|
| `GET /api/weather?lat=&lon=` | Apple WeatherKit current, hourly, daily, next hour, and alerts |
| `GET /api/weather-status` | Signs an ES256 JWT and asks Apple whether that token is accepted |
| `GET /api/point-alerts?lat=&lon=` | Location-specific NWS alerts, including recent emergencies |
| `GET /api/alerts?type=` | Radar NWS polygons |
| `GET /api/outlook?lat=&lon=` | SPC outlook for a point |
| `GET /api/getActiveStorms` | NHC active cyclones |
| `GET /api/lightning` | Recent IEM local storm reports used as lightning proximity |
| `GET /api/fires` | VIIRS detections plus EONET events |
| `GET /api/wildfires` | NASA EONET wildfire events |
| `GET /api/news` | NWS alert headlines |
| `GET /api/tile` | Radar tile proxy |
| `GET /api/site` | Confirms this Worker is the weather app and returns the marketing URL |
| `POST /api/nws` | Location search and point metadata |

If WeatherKit secrets are missing, the private key will not sign, or Apple rejects the token, the Forecast page keeps loading from Open-Meteo and NWS. `/api/weather-status` reports `auth` as `missing`, `invalid_key`, `rejected`, or `unreachable` instead of claiming success from secret presence alone.
