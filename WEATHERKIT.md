# Apple WeatherKit setup

This app can use [Apple WeatherKit](https://developer.apple.com/weatherkit/) for current conditions and forecasts via `/api/weather`. Radar and NWS alerts work without Apple credentials; WeatherKit is optional but higher quality for forecast data.

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
5. Enable **WeatherKit** → Configure if prompted → Save

This Services ID becomes your `WEATHERKIT_SERVICE_ID`.

## Step 3 — Create a WeatherKit API key

1. Go to [Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click **+** to create a key
3. Name: `YouNeeK Pro Radar WeatherKit`
4. Enable **WeatherKit**
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

Set secrets on the `youneekproradarbaby` Worker (never commit these):

```bash
npx wrangler secret put WEATHERKIT_TEAM_ID
npx wrangler secret put WEATHERKIT_KEY_ID
npx wrangler secret put WEATHERKIT_SERVICE_ID
npx wrangler secret put WEATHERKIT_PRIVATE_KEY
```

Or in the Cloudflare dashboard: **Workers & Pages → youneekproradarbaby → Settings → Variables and Secrets → Add**.

After saving secrets, redeploy (push a commit or **Retry deployment** in Builds).

## API usage

```
GET /api/weather?lat=37.77&lon=-122.42
```

| Parameter | Required | Description |
|---|---|---|
| `lat` | Yes | Latitude |
| `lon` | Yes | Longitude |
| `dataSets` | No | Comma-separated WeatherKit data sets. Default: `currentWeather,forecastHourly,forecastDaily,forecastNextHour,weatherAlerts`. The Worker always sends `country=US` so Apple weather alerts can return. |

## Troubleshooting

| Problem | Fix |
|---|---|
| `WeatherKit is not configured` | Set all four `WEATHERKIT_*` variables |
| `401` / `403` from Apple | Verify Team ID, Key ID, Services ID, and that WeatherKit is enabled on both the key and Services ID |
| Invalid private key | Ensure `.p8` newlines are preserved (`\n` in `.env` or multiline quoted string) |
| Works locally but not in production | Run `wrangler secret list` and confirm all four secrets exist on the deployed Worker |

## Pricing note

Apple includes **500,000 WeatherKit API calls per month** with Developer Program membership. See [Apple's WeatherKit documentation](https://developer.apple.com/documentation/weatherkit) for limits and billing beyond that.
