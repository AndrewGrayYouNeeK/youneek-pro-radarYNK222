# Deploy guide — landing + radar

This repository is one Cloudflare Worker:

| Path | What it is |
|------|------------|
| `/` | Cinematic landing (MAKING IT RAIN) |
| `/Radar` (`/app`) | Live NEXRAD radar product |
| `/Forecast` `/Globe` `/Contacts` `/Settings` | Forecast, 3D globe, safety, prefs |
| `/api/*` | Worker APIs (always run first) |

Cloudflare Worker: **`youneek-pro-radarynk222`**.

## Workers Builds

`wrangler.jsonc` serves `./dist` as static assets and sends `/api/*` to the Worker first.

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

## First-time Cloudflare setup

1. Install and log in:

   ```bash
   npm install
   npx wrangler login
   npx wrangler whoami
   ```

2. Optional WeatherKit secrets (forecast still works without them):

   ```bash
   npx wrangler secret put WEATHERKIT_TEAM_ID
   npx wrangler secret put WEATHERKIT_KEY_ID
   npx wrangler secret put WEATHERKIT_SERVICE_ID
   npx wrangler secret put WEATHERKIT_PRIVATE_KEY
   ```

   Dashboard path: **Workers & Pages → youneek-pro-radarynk222 → Settings → Variables and Secrets**.

3. Build and deploy:

   ```bash
   npm run deploy
   ```

4. Confirm APIs:

   ```bash
   curl https://youneek-pro-radarynk222.<your-subdomain>.workers.dev/api/health
   ```

## API routes (Worker)

| Route | Purpose |
|-------|---------|
| `GET /api/health` | Status, WeatherKit configured?, route list |
| `GET /api/forecast?lat=&lon=` | Open-Meteo current / hourly / 16-day |
| `GET /api/air?lat=&lon=` | AQI, UV, pollen |
| `GET /api/geocode?q=` | Place search |
| `GET /api/weather?lat=&lon=` | Apple WeatherKit (needs secrets) |
| `GET /api/alerts?type=` | NWS warning polygons |
| `GET /api/alerts?point=lat,lon` | Local NWS alerts |
| `GET /api/lightning` | Lightning / storm reports |
| `GET /api/fires` | EONET + FIRMS wildfires |
| `GET /api/outlook?lat=&lon=` | SPC Day 1 storm risk |
| `GET /api/rainviewer` | Live / future / satellite catalog |
| `GET /api/tile?u=` | RainViewer tile proxy |
| `GET /api/getActiveStorms` | NHC tropical cyclones |
| `POST /api/nws` | Landing GPS, geocode, storm cells |

**WeatherKit:** [WEATHERKIT.md](./WEATHERKIT.md). Set `WEATHERKIT_*` secrets in Cloudflare.

## Local

```bash
npm install
npm run dev
```

Vite proxies `/api/*` through the same Worker handlers used in production.

```bash
curl http://localhost:5173/api/health
curl "http://localhost:5173/api/forecast?lat=38.25&lon=-85.76"
```
