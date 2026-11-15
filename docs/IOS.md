# YouNeeK Pro Radar on iOS

The iOS app is the same Vite site, wrapped with Capacitor 8. The Xcode project is `ios/`. It uses Swift Package Manager, so CocoaPods is not required.

Bundle id: `com.base69facdfe1fbc3700e00a8387.app` (existing App Store Connect listing, Apple ID `6766993130`)  
Display name: `YouNeeK Pro Radar`

Do not change the bundle id. It must stay aligned with the existing App Store Connect app. The Capacitor `appId` in `capacitor.config.json` and `PRODUCT_BUNDLE_IDENTIFIER` in Xcode already use this value.

## Open it on a Mac

Cloud agents cannot open Xcode. On a Mac, from this repo:

```bash
npm install
npm run build:ios
npm run cap:open
```

`build:ios` runs `vite build` and `npx cap sync ios`, which copies `dist/` into the native project. `cap:open` is `npx cap open ios`.

Then in Xcode:

1. Select the App target.
2. Signing & Capabilities: choose your Team. Let Xcode create the provisioning profile for `com.base69facdfe1fbc3700e00a8387.app`.
3. Pick your iPhone and press Run.

`ios/App/App/public`, `ios/App/Pods`, `ios/App/build`, and Xcode user data are gitignored. Do not commit them.

## What the native shell does

- Location uses `@capacitor/geolocation` while the app is in use, and falls back to the browser geolocation API on the website.
- Last location, safety contacts, and the rest of the existing local settings are mirrored into `@capacitor/preferences` on device. The website still uses local storage only.
- A severe warning triggers a warning haptic once per alert. Simulators often have no haptic engine.
- Help Me and I’m Sheltering open one `sms:` draft for the contacts saved on the device. You tap Send. iPad and any device that cannot compose SMS gets the share sheet instead of a crash.
- The status bar uses light text on the dark UI. The splash and icon are the tactical radar mark. Review both before you ship.
- The app does not ask for notification permission at launch, and it does not include App Tracking Transparency.

The native WebView origin is `capacitor://localhost`. API calls from the app go to `https://youneek-pro-radarynk222.youneekartifacts.workers.dev` unless you set `VITE_API_BASE_URL` at build time. Do not put WeatherKit secrets in any `VITE_` variable. Those keys stay on the Worker.

## Scripts

| Script | Command |
| --- | --- |
| `npm run build:ios` | Production web build, then `cap sync ios` |
| `npm run cap:sync` | `npx cap sync ios` |
| `npm run cap:open` | `npx cap open ios` |

## CI / App Store upload

GitHub Actions builds a signed IPA for App Store Connect / TestFlight on `macos-15` with **Xcode 26** (iOS 26 SDK). See [IOS_CI.md](./IOS_CI.md) for secrets, how to run the workflow, and the automatic + cloud signing setup.

## Device test checklist

Run this on a real iPhone. The simulator is not enough for SMS or haptics.

- [ ] First launch does not crash, and it does not ask for notification permission.
- [ ] Location prompt appears with the When In Use explanation. Allow it. Radar and the forecast center on you.
- [ ] Deny location (or reset privacy for the app). The home screen offers city/ZIP search and Open Settings. Radar still opens.
- [ ] Turn on airplane mode. An offline note appears. Turn the network back on and pull to refresh or reopen Now. Data returns.
- [ ] Radar status line shows a frame time and an "updated … ago" age without covering the map.
- [ ] Help Me and I’m Sheltering stay hidden until a warning covers the location, or until you open the review link in `docs/APP_STORE.md`.
- [ ] Before the first text, the app explains that the draft contains coordinates and map links. Cancel sends nothing.
- [ ] Continue opens one Messages draft. The body has latitude, longitude, an Apple Maps link, and a Google Maps link. You must tap Send. Nothing sends if you cancel.
- [ ] With no contacts saved, the buttons explain that a contact is required and do not crash.
- [ ] On an iPad, or if Messages cannot open, the app says so and offers the share sheet instead of crashing.
- [ ] Settings → Privacy shows the policy, and `https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy` loads the same text without signing in.
