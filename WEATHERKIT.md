# Apple WeatherKit setup

This weather app uses the [Apple WeatherKit REST API](https://developer.apple.com/weatherkit/) for current conditions, hourly, daily, next-hour precipitation, and weather alerts via `/api/weather`. The Cloudflare Worker signs a short-lived ES256 JWT with the `.p8` key. Radar, NWS alerts, and Open-Meteo forecasts work when the key is missing or Apple rejects it.

The marketing site [https://youneekproradar.com](https://youneekproradar.com) is a different Worker. Do not put these secrets there.

## Requirements

- **Apple Developer Program** membership ($99/year)
- A Mac is helpful for iOS/Xcode, but **web + Cloudflare only needs the REST API key** below

## Step 1 — Enroll in Apple Developer Program

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs/)
2. Sign in with your Apple ID and enroll (or renew) the Developer Program
3. Note your **Team ID** (10 characters): [developer.apple.com/account → Membership details](https://developer.apple.com/account)

## Step 2 — Register a Services ID

1. Open [Certificates, Identifiers & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Click **+** → choose **Services IDs** → Continue
3. Description: `YouNeeK Pro Radar Weather`
4. Identifier: `com.youneek.proradar.weather` (must be unique to your account)
5. Enable the **WeatherKit** capability → Configure if prompted → Save

This Services ID becomes your `WEATHERKIT_SERVICE_ID`. WeatherKit must be enabled on this Services ID, not only on an iOS app identifier.

## Step 3 — Create a WeatherKit API key

1. Go to [Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click **+** to create a key
3. Name: `YouNeeK Pro Radar WeatherKit`
4. Enable the **WeatherKit** capability on the key
5. Register → **Download** the `.p8` file (you can only download it once)
6. Note the **Key ID** shown on the page → this is `WEATHERKIT_KEY_ID`

## Step 4 — Local development

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Fill in `.env`:

   | Variable | Value |
   |---|---|
   | `WEATHERKIT_TEAM_ID` | Your 10-character Team ID |
   | `WEATHERKIT_KEY_ID` | Key ID from step 3 |
   | `WEATHERKIT_SERVICE_ID` | Services ID from step 2 (e.g. `com.youneek.proradar.weather`) |
   | `WEATHERKIT_PRIVATE_KEY` | Contents of the `.p8` file |

   For the private key, either paste the full PEM with real newlines inside quotes, or use `\n` for line breaks on one line:

   ```
   WEATHERKIT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----"
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Test (replace lat/lon with your location):

   ```bash
   curl "http://localhost:5173/api/weather?lat=37.77&lon=-122.42&dataSets=currentWeather"
   ```

   - **503** → credentials missing or incomplete in `.env`
   - **200** → WeatherKit is working

## Step 5 — Production (Cloudflare Worker)

Set secrets on the **`youneek-pro-radarynk222`** Worker (never commit these, and never paste them into git):

```bash
npx wrangler secret put WEATHERKIT_TEAM_ID
npx wrangler secret put WEATHERKIT_KEY_ID
npx wrangler secret put WEATHERKIT_SERVICE_ID
npx wrangler secret put WEATHERKIT_PRIVATE_KEY
```

`wrangler secret put` reads `name` from `wrangler.toml`, which is `youneek-pro-radarynk222`. Paste the `.p8` contents when prompted for `WEATHERKIT_PRIVATE_KEY`. Do not store the key in `.env` on the server, and do not commit `.env`.

Or in the Cloudflare dashboard: **Workers & Pages → youneek-pro-radarynk222 → Settings → Variables and Secrets → Add**.

For `WEATHERKIT_PRIVATE_KEY`, paste the **entire** `AuthKey_XXXXXX.p8` file, including both of these lines:

```
-----BEGIN PRIVATE KEY-----
-----END PRIVATE KEY-----
```

If the dashboard flattens it to one line, that is OK as long as those BEGIN/END markers are still there.

After saving secrets, redeploy (push a commit or **Retry deployment** in Builds).

## API usage

```
GET /api/weather?lat=37.77&lon=-122.42
```

| Parameter | Required | Description |
|---|---|---|
| `lat` | Yes | Latitude |
| `lon` | Yes | Longitude |
| `dataSets` | No | Comma-separated WeatherKit data sets. Default: `currentWeather,forecastHourly,forecastDaily,forecastNextHour,weatherAlerts`. |
| `country` | No | ISO country code. When omitted, a US National Weather Service point match uses `US`, otherwise the country comes from reverse geocoding. |

The Worker asks Apple's availability endpoint for that latitude, longitude, and country, then requests only the datasets Apple lists. `weatherAlerts` is included only when that list contains it, and the weather call sends `country` so Apple will return alerts. `timezone` is `auto`.

`GET /api/weather-status` checks availability for Cupertino with `country=US`, so the reported dataset list includes `weatherAlerts` when Apple offers it.

### Auth health check

```
GET /api/weather-status
```

This signs a JWT and calls `https://weatherkit.apple.com/api/v1/availability/37.3349/-122.0090`. It does not return the token or any secret value.

| Field | Meaning |
|---|---|
| `auth: "ok"` | Apple accepted the token. `appleStatus` is 200. |
| `auth: "missing"` | One or more of the four secret names is empty. `missing` lists them. |
| `auth: "invalid_key"` | The `.p8` could not be signed as ES256. |
| `auth: "rejected"` | Apple answered 401/403 or another error. Secret presence alone is not treated as success. |
| `auth: "unreachable"` | The Worker could not reach Apple. |
| `fallback` | Always `open-meteo` and `nws`. The Forecast page uses those when `ok` is false. |

Settings → Weather data shows the same status.

## Troubleshooting

| Problem | Fix |
|---|---|
| `WeatherKit is not configured` | Set all four `WEATHERKIT_*` secrets on **youneek-pro-radarynk222** |
| `PKCS#8` / invalid private key | Re-paste the full `.p8` file into `WEATHERKIT_PRIVATE_KEY` (include BEGIN/END lines). Then retry the Workers deploy. |
| `401` / `403` from Apple | Verify Team ID, Key ID, Services ID, and that WeatherKit is enabled on both the key and Services ID |
| Forecast still shows Open-Meteo | Open `/api/weather-status`. WeatherKit is the source only when `auth` is `ok`. Until then, current, hourly, and daily come from Open-Meteo, and alerts come from NWS. |
| Works locally but not in production | Confirm secrets are on `youneek-pro-radarynk222`, not an older Worker name |

## Pricing note

Apple includes **500,000 WeatherKit API calls per month** with Developer Program membership. See [Apple's WeatherKit documentation](https://developer.apple.com/documentation/weatherkit) for limits and billing beyond that.
