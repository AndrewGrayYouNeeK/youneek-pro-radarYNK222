# Deploy guide — landing + radar

This repository is one app:

| Path | What it is |
|------|------------|
| `/` | Cinematic landing (MAKING IT RAIN) |
| `/Radar` (`/app`) | Live NEXRAD radar product |
| `/Forecast` `/Globe` `/Contacts` `/Settings` | WeatherKit, globe, safety, prefs |

Cloudflare project: **`youneek-pro-radarynk222`**.

**Production URL:** [https://youneek-pro-radarynk222.youneekartifacts.workers.dev](https://youneek-pro-radarynk222.youneekartifacts.workers.dev)

## Workers Builds

`wrangler.toml` sets `[assets] directory = "./dist"` and `run_worker_first = true` so the Worker can set `no-store` on HTML (the landing shell) and 404 missing hashed assets instead of serving `index.html`.

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

## API routes (Worker)

| Route | Purpose |
|-------|---------|
| `POST /api/nws` | Landing GPS / conditions / alerts proxy |
| `GET /api/alerts?type=` | Radar NWS polygons |
| `GET /api/getActiveStorms` | NHC tropical cyclones |
| `GET /api/weather?lat=&lon=` | WeatherKit (needs secrets) |
| `GET /api/lightning` | Lightning reports |

**WeatherKit:** [WEATHERKIT.md](./WEATHERKIT.md). Set `WEATHERKIT_*` secrets in Cloudflare.

## Local

```bash
npm install
npm run dev
```

## Cloudflare Tunnel (local origin)

```bash
npm run tunnel
```

Starts the app on `http://localhost:8000` and prints a public Quick Tunnel URL. No UUID, login, or DNS setup. See [TUNNEL.md](./TUNNEL.md).
