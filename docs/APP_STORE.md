# App Store review notes

The ready-to-paste listing, screenshot shot list, and the “one tap sends” wording note are in `docs/APP_STORE_LISTING.md` and `fastlane/metadata/en-US/`. This file is the privacy and review answer sheet. Confirm it again if the data flow changes.

## Privacy nutrition labels

Tracking: **No**. Do not select "Data Used to Track You". There is no analytics SDK, no ads SDK, no attribution SDK, and no App Tracking Transparency prompt. `NSPrivacyTracking` is false. The app does not read the advertising identifier.

Data not linked to you (no account, no user id):

| Data | Collected? | Purpose | Where it goes |
| --- | --- | --- | --- |
| Precise location | Yes | App functionality | Sent when a forecast, alert, or map is loaded. Not stored on our server. |
| Coarse location | Yes, only as a side effect of map tiles | App functionality | RainViewer and Iowa Mesonet tile requests show the map area on screen. |
| Search history | City or ZIP text is sent to geocoders and is not stored by us | App functionality | Declare it if the questionnaire treats those queries as searches. |
| Contacts | No | — | Names and numbers stay in on-device Preferences. They leave the device only when the user taps Send in Messages or the share sheet. |
| Name, email, phone, user id, payment, diagnostics, product interaction, advertising data | No | — | Not collected. There is no in-app purchase and no crash SDK. |

Third parties that receive a location or a search:

- Cloudflare Worker `https://youneek-pro-radarynk222.youneekartifacts.workers.dev` (`/api/weather`, `/api/point-alerts`, `/api/outlook`, `/api/nws`, and the other `/api` routes).
- Apple WeatherKit, called only by the Worker. The `.p8` key is a Worker secret. It is not in the app bundle.
- National Weather Service (`api.weather.gov`), usually through the Worker. The news page can also request active alerts without a private key.
- Open-Meteo forecast and geocoding, called from the app.
- RainViewer radar catalog and tiles.
- Iowa Environmental Mesonet (Iowa State University) radar and satellite tiles, and some outlook data through the Worker.
- NHC and NASA EONET for storms and wildfires. Those calls do not include the user's coordinates.

`VITE_AERIS_CLIENT_ID` and `VITE_AERIS_CLIENT_SECRET` are optional build-time values for a wind readout. Leave them unset. If they are set, Vite inlines them into the app and they would ship in the binary. The production build for this PR does not set them.

## Draft privacy policy

The same text is the in-app Privacy screen and the public page:

`https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy`

Source: `src/content/privacyPolicy.js` and `public/privacy.html`. Paste that URL into App Store Connect as the Privacy Policy URL. It has to be live before review, which happens when this branch is merged and the Worker deploy finishes.

## Privacy manifest

`ios/App/App/PrivacyInfo.xcprivacy`

- `NSPrivacyTracking` is false.
- No tracking domains.
- Required-reason API: User Defaults, reason `CA92.1`, because `@capacitor/preferences` stores contacts, the last location, and settings on device only.
- Collected data type declared in the manifest: precise location, not linked, not tracking, purpose app functionality.

Capacitor plugins ship their own manifests inside the Swift packages. Do not add a tracking domain to any of them.

## Info.plist

- `NSLocationWhenInUseUsageDescription`: "YouNeeK Pro Radar needs your location to show radar and alerts for your area and to include your coordinates in the I’m Sheltering emergency text."
- No Always / background location, no `UIBackgroundModes` for location.
- `UIUserInterfaceStyle` is `Dark`.
- No `NSUserTrackingUsageDescription`.
- `ITSAppUsesNonExemptEncryption` is false (HTTPS only). Confirm that before you answer the export question.

Notifications are not requested at launch. The website's "Browser notifications" switch is hidden in the native app. Adding push later is a separate change: a usage string, a permission request at a moment the user understands, and a background mode only if you truly need one.

## How a reviewer sees Help Me / I’m Sheltering

Those buttons appear only when an active severe warning covers the selected location. They are not on the home screen in clear weather.

The website already accepts `?safetyPreview=Tornado%20Warning`, shows a "Simulated alert" label, and turns off with `?safetyPreview=0`. The iOS app uses that same switch. It is not a tracking endpoint and it does not phone home. It writes one local label so the existing safety card can render.

For the installed app, open this URL on the iPhone (Messages, Notes, or Safari):

`youneekproradar://safety-preview`

To turn the simulated warning off:

`youneekproradar://open?safetyPreview=0`

Suggested review notes:

> Location is When In Use only. To see Help Me and I’m Sheltering without a live warning, open youneekproradar://safety-preview on the device. The card is labeled Simulated alert. The buttons open a message draft; the reviewer must tap Send. Contacts are typed in Settings → Contacts and stay on the device. No account is required. Privacy policy: https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy

Screenshot steps for each store image are in `docs/APP_STORE_LISTING.md`.

If you would rather not ship a review URL in the binary, delete the `youneekproradar` URL type and `installReviewLink` before you archive. Reviewers can still use the website query string, or a real warning. That URL is the smallest switch that reuses the existing preview. It is not a hidden admin login.

## Age rating, screenshots, price

Answer the age-rating questionnaire in App Store Connect. Expected answers from this code: no unrestricted web browser, no ads, no gambling, no user-generated public content, location is used, and the user can compose a personal text. Do not guess a rating number here; Connect shows the result after the questionnaire.

Screenshots have to be captured on a Mac from the simulator or a device. Connect will list the required sizes (typically the current 6.9-inch iPhone and one smaller iPhone). This repo does not include them.

The price is a one-time price in Pricing and Availability, including free if you set it to $0. There is no StoreKit code and no subscription.

Support URL to enter, after you confirm the page shows a way to reach you: `https://youneekproradar.com`

## Play data safety

The Android shell collects the same data as the iOS app. Do not declare tracking, ads, or an advertising id. Package name: `com.youneek.proradar`. Privacy policy URL is the same page as App Store Connect:

`https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy`

The published policy text still says the website and the iOS app. Android follows those same rules. Location is while the app is in use. Contacts and the Help Me / I’m Sheltering wording stay on the device. Backup of app data is off. A text leaves the phone only after the user taps Send in the SMS app.

| Play question | Answer |
| --- | --- |
| Data collected | Precise location, and coarse location as a side effect of map tiles. City or ZIP text is sent to geocoders. |
| Data shared | No data is sold or shared for advertising. Location is sent to the processors listed in the nutrition labels above, for app functionality. |
| Data linked to the user | No. There is no account and no user id. |
| Tracking | No. |
| Advertising ID | Not used. Do not add the advertising-id permission. |
| Contacts | Not collected. Names and numbers stay in on-device Preferences. |
| Encryption in transit | Yes. The WebView and the Worker use HTTPS. |
| Deletion | There is no server account. Deleting the app, or Clear all app data, removes the on-device copy. |
| Safety texts | The app opens a draft. The user taps Send. The app cannot send the message by itself. |

Reviewers can open `youneekproradar://safety-preview` on the device. The card is labeled Simulated alert. Steps and the `adb` command are in `docs/ANDROID.md`.
