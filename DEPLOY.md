# Deploy guide — weather app and landing site

This repository builds **two sites**. The weather app is what `npm run build` and `npm run deploy` publish. The marketing landing page is a separate build and a separate Worker. Neither script changes DNS or attaches `youneekproradar.com`.

| Site | Build | Cloudflare Worker | Home |
|---|---|---|---|
| **Weather app** | `npm run build` → `dist/` | **`youneek-pro-radarynk222`** (`wrangler.toml`) | `/` redirects to `/Radar` |
| **Landing page** | `npm run build:landing` → `dist-landing/` | **`youneek-pro-radar-landing`** (generated config, not committed) | `/` is the marketing page |

Launch buttons on the landing site go to the weather app (`WEATHER_APP_URL`, default `https://youneek-pro-radarynk222.youneekartifacts.workers.dev`).

WeatherKit secrets stay on the weather Worker. The landing Worker sets `SITE_ROLE=landing` and does not need those secrets.

## Weather app

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

`wrangler.toml` keeps `name = "youneek-pro-radarynk222"` and has no custom domain. Do not add a `youneekproradar.com` route here.

CLI: `npm run build && npm run deploy:weather`

## Landing page

| Setting | Value |
|---|---|
| Build command | `npm run build:landing` |
| Deploy command | `npm run deploy:landing` |

`deploy:landing` writes a temporary Wrangler config (it is not a second `wrangler*.toml` in the repo) and publishes `dist-landing` as `youneek-pro-radar-landing`. If Workers Builds runs that script while connected to `youneek-pro-radarynk222`, it deploys the weather app instead of renaming the Worker.

Create the landing Worker in Cloudflare and point it at this command when you want the marketing site online. Do not move `youneekproradar.com` with these scripts.

## API routes (weather Worker)

| Route | Purpose |
|---|---|
| `GET /api/point-alerts?lat=&lon=` | Location-specific NWS alerts, including recent emergencies |
| `GET /api/site` | `landing` vs `weather` role |
| `GET /api/weather-status` | Which WeatherKit secrets the weather Worker sees |
| `GET /api/alerts?type=` | Radar NWS polygons |
| `GET /api/weather?lat=&lon=` | WeatherKit |
| `POST /api/nws` | Landing conditions proxy (also served by the landing Worker) |
