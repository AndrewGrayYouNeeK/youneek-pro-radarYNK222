# Live warning notifications (push) setup

The app can notify phones of **Tornado, Severe Thunderstorm, and Flash Flood Warnings** for
their area even when the app is closed. The code is merged and deployed, and it **does nothing until the
keys below are added**. No key means no sends, no errors, and no extra API calls.

## How it works

1. Onboarding order: safety contacts → location → **Warning alerts** (the notification permission prompt) → radar.
   Users can also turn it on later in Settings → Lock screen alerts. If they block notifications, the radar
   shows a small dismissible "Notifications are off" banner with **Open Settings**.
2. With permission, the app gets an APNs (iOS) or FCM (Android) token and POSTs
   `/api/push/register` with the token and the location **rounded to 0.1° (~11 km)**. The Worker
   rounds again, looks up the NWS forecast zone + county for that point, and stores
   `token + zone codes + rounded point` in Workers KV (`PUSH_KV`, 30-day TTL, refreshed while the app is used).
   If notifications get turned off, the app calls `/api/push/unregister`.
3. A cron trigger (`*/2 * * * *`) polls `api.weather.gov/alerts/active` for the three warning types
   (`message_type=alert`, so updates/continuations do not re-notify). Each new alert ID is pushed once to
   devices whose zones match the warning's UGC codes and whose rounded point is in or near the polygon.
   Dead tokens (APNs 410 / FCM UNREGISTERED) are deleted.
4. Tapping a notification opens **/Radar**, where I'm Safe / I Need Help appear for the warning.
5. Fallback: while the app is open and server push is not set up, the app polls the alerts for the
   current place every 2 minutes and shows a **local notification** for a new warning.

## Worker secrets (exact names)

Set with `npx wrangler secret put NAME` from the repo root (paste the value when asked; never commit it):

| Secret | Value |
| --- | --- |
| `APNS_KEY_ID` | The 10-character Key ID of the APNs key (.p8) |
| `APNS_TEAM_ID` | `4NJ8T765L2` |
| `APNS_BUNDLE_ID` | `com.base69facdfe1fbc3700e00a8387.app` (iOS bundle id in `capacitor.config.json` / Xcode) |
| `APNS_PRIVATE_KEY` | Full contents of `AuthKey_XXXXXXXXXX.p8`, including the BEGIN/END lines |
| `FCM_SERVICE_ACCOUNT` | Full JSON of a Firebase service account key (has `project_id`, `client_email`, `private_key`) |
| `PUSH_MAX_SENDS` (optional var) | Sends per cron run. Default 40 (Workers Free subrequest limit). Set 500+ on Workers Paid. |

iOS sends need all four `APNS_*`; Android sends need `FCM_SERVICE_ACCOUNT`. Either platform works alone.
Check what is missing without sending anything:

```bash
npx wrangler secret list
```

## 1. Apple (iOS)

1. developer.apple.com → Certificates, IDs & Profiles → **Keys** → **+** → name "YouNeeK Push", check
   **Apple Push Notifications service (APNs)** → Continue → Register → **Download** the `.p8` (one-time download).
   Note the **Key ID**. Keep the `.p8` with your other keys (outside the repo).
2. Identifiers → `com.base69facdfe1fbc3700e00a8387.app` → enable **Push Notifications** → Save.
3. Xcode → open `ios/App/App.xcworkspace` → target **App** → **Signing & Capabilities** → **+ Capability** →
   **Push Notifications**, then **+ Capability** → **Time Sensitive Notifications** (lets Tornado Warnings break through Focus). This adds `App.entitlements`; commit it. No background modes are needed.
4. Add the four `APNS_*` secrets above.
5. Build and upload a new iOS build (TestFlight/App Store builds use production APNs). For a debug build run
   straight from Xcode, build the web app with `VITE_APNS_SANDBOX=1 npm run build && npx cap sync ios` so the
   token is sent to the APNs sandbox.

Until step 3 ships in a build, iOS registration fails quietly and the app keeps local notifications only.

## 2. Firebase (Android)

1. console.firebase.google.com → **Add project** (Analytics **off**) → Add app → **Android**, package name
   `com.youneek.proradar` → download **google-services.json** → put it at `android/app/google-services.json`.
   The Gradle build applies the Google Services plugin only when that file exists. The file contains public
   client config, not a secret, but you can keep it out of git if you prefer (CI must then provide it).
2. Project settings → **Service accounts** → **Generate new private key** → this JSON is `FCM_SERVICE_ACCOUNT`
   (`npx wrangler secret put FCM_SERVICE_ACCOUNT < service-account.json`). It is a secret; never commit it.
3. Make sure **Firebase Cloud Messaging API (V1)** is enabled (Project settings → Cloud Messaging).
4. Build a new `.aab` (version code +1) and upload it to Play internal testing.

Without `google-services.json` the app skips FCM registration (no crash) and keeps local notifications.

## 3. Verify

```bash
npx wrangler deployments list           # newest deployment is live
# Dashboard: Workers & Pages → youneek-pro-radarynk222 → Settings → Triggers lists the cron *
npx wrangler tail youneek-pro-radarynk222 --format pretty   # cron logs "push: N new warnings, M matches, S sent ..."
npx wrangler kv key list --binding PUSH_KV --remote | head  # dev:<hash> keys appear after phones register
```

Install the new build, finish onboarding with alerts on, and wait for (or find) an active warning in the
phone's county. The phone should get one notification per warning.

## Privacy

Stored per phone: push token, NWS zone codes, location rounded to ~11 km. Nothing else, no account, 30-day TTL.
Precise GPS never leaves the phone for this feature. See `/privacy` and `docs/APP_STORE.md` for the store answers.
