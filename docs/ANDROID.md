# YouNeeK Pro Radar on Android

The Android app is the same Vite site, wrapped with Capacitor 8. The Android Studio project is `android/`. It uses the same app id and display name as iOS.

Application id: `com.youneek.proradar`  
Display name: `YouNeeK Pro Radar`

`server.androidScheme` in `capacitor.config.json` is `https`, so the WebView origin is `https://localhost`. API calls still go to `https://youneek-pro-radarynk222.youneekartifacts.workers.dev` unless you set `VITE_API_BASE_URL` at build time. Do not put WeatherKit secrets in any `VITE_` variable. Those keys stay on the Worker.

The Worker allowlist must include `https://localhost` or those API calls fail in the app. That origin is in `functions/_lib/cors.js`. Ship the Worker before you treat a device build as able to load forecasts. iOS keeps using `capacitor://localhost`. The allowlist is those exact origins only.

## Open it in Android Studio

This environment cannot install the Android SDK or open Android Studio. On a machine that has Android Studio, from this repo:

```bash
npm install
npm run build:android
npm run cap:open:android
```

`build:android` runs `vite build` and `npx cap sync android`, which copies `dist/` into the native project. `cap:open:android` is `npx cap open android`.

The iOS scripts are unchanged: `npm run build:ios`, `npm run cap:sync`, and `npm run cap:open` still target iOS only. To sync Android without rebuilding the web app, run `npm run cap:sync:android`.

Then in Android Studio:

1. Let Gradle sync. If it asks for a missing SDK, install the SDK version in `android/variables.gradle` (`compileSdk` / `targetSdk`).
2. Select the `app` run configuration and a device or emulator.
3. Press Run. The debug build is signed with the debug keystore. That build is for your device, not for Play.

`android/app/src/main/assets/public`, `android/app/build`, `android/.gradle`, and `local.properties` are gitignored. Do not commit them. Do not commit an upload keystore (`*.jks`, `*.keystore`) or a `google-services.json`.

## What the native shell does

- Location uses `@capacitor/geolocation` while the app is open. The manifest declares `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` only. There is no background-location permission, so Android offers "While using the app", "Only this time", and "Don't allow". It does not offer "Allow all the time".
- The debug manifest merge also includes `VIBRATE` from the haptics plugin and `ACCESS_NETWORK_STATE` from AndroidX. Those are not analytics, ads, or an advertising id.
- GPS hardware is optional (`android:required="false"`). A phone without GPS can still search by city or ZIP.
- Open Settings uses the same `app-settings:` link as iOS. On Android that link opens this app's system settings page. Allow location only while using the app.
- Last location, safety contacts, and the rest of the existing local settings are mirrored into `@capacitor/preferences` on device. Backup and device-to-device transfer of those preferences are turned off (`android:allowBackup="false"` and `data_extraction_rules.xml`).
- A severe warning triggers a warning haptic once per alert, same as iOS. The haptics plugin adds the vibrate permission when Gradle merges manifests.
- Help Me and I’m Sheltering open one SMS draft for the contacts saved on the device. Android uses `sms:` with `?body=`. You tap Send in the SMS app. The app does not declare a permission that would let it send the text itself. Contacts stay on the device.
- The same review link as iOS shows the simulated warning: `youneekproradar://safety-preview`. Turn it off with `youneekproradar://open?safetyPreview=0`. The card is labeled Simulated alert. It is the existing preview, not a new Android path.
- The status bar uses light text on the dark UI. The splash and icon are the same radar mark as iOS. Review both before you ship.
- The app does not ask for notification permission, and it does not include an advertising id, analytics SDK, or ads SDK.

## Signing

Play requires an Android App Bundle (`.aab`) signed with an upload key. Keep that keystore outside this repo.

1. In Android Studio: Build → Generate Signed App Bundle or APK → Android App Bundle.
2. Create a new upload keystore if you do not already have one. Store it outside the repo, and store the passwords in a password manager. If you lose the upload key, Play App Signing can reset it, but only if you enrolled in Play App Signing on the first upload.
3. Choose the `release` build type. Leave the app id as `com.youneek.proradar`.
4. On the first upload, enroll in Play App Signing and let Google hold the app signing key. You keep the upload key.
5. Each later upload needs a higher `versionCode` in `android/app/build.gradle`. `versionName` is the version users see. The first project values are `versionCode 1` and `versionName "1.0"`.

A debug APK from the Run button is not the file you upload.

## Play Store AAB

1. `npm install`
2. `npm run build:android`
3. `npm run cap:open:android`
4. Build → Generate Signed App Bundle or APK → Android App Bundle → release.
5. Play Console → YouNeeK Pro Radar (`com.youneek.proradar`) → Test and release → internal testing → Create release → upload the `.aab`.
6. After the internal track looks right, promote to production.

The listing copy for iOS is in `docs/APP_STORE_LISTING.md`. You can reuse the description. Play has its own title length, short description (80 characters), and full description (4000). Do not turn on ads or tracking to fill the data-safety form. The answers that match this code are in `docs/APP_STORE.md`.

Privacy policy URL, same page as iOS:

`https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy`

That page still describes the website and the iOS app. The Android shell follows the same rules. Before Play review, add Android to those sentences in `src/content/privacyPolicy.js` and `public/privacy.html` if you want the public page to name both apps. This change set does not edit that copy, so the iOS privacy screen stays as it is.

## Device test checklist

Run this on a real phone. An emulator is enough to see the shell, and not enough for SMS or GPS.

- [ ] First launch does not crash, and it does not ask for notification permission.
- [ ] Location prompt offers while-in-use (or only this time), not all the time. Allow it. Radar and the forecast center on you.
- [ ] Deny location. The home screen offers city/ZIP search and Open Settings. Open Settings lands on this app's Android settings. Radar still opens.
- [ ] Turn on airplane mode. An offline note appears. Turn the network back on and pull to refresh or reopen Now. Data returns.
- [ ] Radar status line shows a frame time and an "updated … ago" age without covering the map.
- [ ] Help Me and I’m Sheltering stay hidden until a warning covers the location, or until you open `youneekproradar://safety-preview`.
- [ ] Before the first text, the app explains that the draft contains coordinates and map links. Cancel sends nothing.
- [ ] Continue opens one SMS draft to the saved contacts. The body has latitude, longitude, an Apple Maps link, and a Google Maps link. You must tap Send. Nothing sends if you back out.
- [ ] With no contacts saved, the buttons explain that a contact is required and do not crash.
- [ ] Settings → Privacy shows the policy, and `https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy` loads the same text without signing in.

To open the simulated warning from a computer plugged into the phone:

```bash
adb shell am start -a android.intent.action.VIEW -d "youneekproradar://safety-preview" com.youneek.proradar
```

To turn it off:

```bash
adb shell am start -a android.intent.action.VIEW -d "youneekproradar://open?safetyPreview=0" com.youneek.proradar
```

A tappable link in Notes or Messages works too. Chrome's address bar often will not launch a custom scheme.
