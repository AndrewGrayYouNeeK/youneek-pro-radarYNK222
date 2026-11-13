# Launch checklist

Checked items are done in this branch. Unchecked items need a Mac, a device, or App Store Connect.

## Before TestFlight

- [ ] Builds and runs on a real iPhone. Not verified here. Xcode is not available in this environment. See `docs/IOS.md`.
- [x] Location permission copy is specific and When In Use only (`NSLocationWhenInUseUsageDescription`).
- [ ] Location prompt, allow, and deny are confirmed on a device. The app has a city/ZIP search and an Open Settings path. See the device checklist in `docs/IOS.md`.
- [x] Radar status line includes a frame clock and "updated X min ago" when a frame time is known. Live frames use the latest RainViewer past frame. The line is the existing status pill, not a new panel.
- [ ] Alerts appear correctly on a device during a real warning.
- [x] I’m Sheltering draft includes exact coordinates and a Google Maps link, and says the user is sheltering and safe. The user taps Send. No automatic or repeat send. Listing text is verbatim in `docs/APP_STORE_LISTING.md`; the “one tap sends” line is called out there for Andrew to change if he wants.
- [ ] No crash on first launch or when location is denied. Needs a device.
- [x] Privacy policy is in the app (Settings → Privacy) and as a static page at `/privacy`, served by the Worker once this is merged.
- [x] App icon (1024, plus dark and tinted) and splash are generated from the existing radar mark. Andrew should review them before upload. They are a best-effort brand mark, not a final marketing illustration.

## TestFlight

- [ ] Internal testing first, then an external group.

On a Mac:

1. `npm install`
2. `npm run build:ios`
3. `npm run cap:open`
4. Xcode → App target → Signing & Capabilities → select the YouNeeK Team.
5. Confirm the bundle id `com.youneek.proradar` (change it first if you want a different id) and the display name YouNeeK Pro Radar.
6. Product → Archive. Use a generic iOS device or Any iOS Device, not a simulator.
7. When the Organizer opens, Distribute App → App Store Connect → Upload.
8. App Store Connect → TestFlight → wait for processing.
9. Internal testing: add yourself and anyone on the App Store Connect team. Internal builds do not need Beta App Review.
10. External testing: create an external group, add the build, and submit for Beta App Review. Put the shelter-preview steps from `docs/APP_STORE.md` in the beta review notes.

## App Store Connect

- [ ] Create the app record, upload the build, fill metadata, screenshots, and privacy labels, set the one-time price, and submit.

Paste the listing from `docs/APP_STORE_LISTING.md`, or from `fastlane/metadata/en-US/`. Do not rewrite it in Connect.

| Field | Value |
| --- | --- |
| Name | YouNeeK Pro Radar |
| Bundle ID | com.youneek.proradar |
| SKU | youneek-pro-radar-ios |
| Subtitle | Tactical NEXRAD & Alerts |
| Primary category | Weather |
| Secondary category | Navigation (optional) |
| Privacy policy URL | https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy |
| Support URL | https://youneekproradar.com |
| Price | One-time price in Pricing and Availability. No subscription and no in-app purchase. |

Privacy labels: follow `docs/APP_STORE.md`. Do not turn on tracking.

Age rating: 4+ after the questionnaire. Do not add ads or a web browser to change the answers.

Screenshots: follow the six-shot list in `docs/APP_STORE_LISTING.md`, including how to show a warning polygon and the I’m Sheltering confirmation. Use the sizes App Store Connect lists. This repo does not include image files.

Submit: select the uploaded build, answer export compliance (the app only uses HTTPS; `ITSAppUsesNonExemptEncryption` is false), and submit for review. Paste the review notes from `docs/APP_STORE.md`.

## Play Store

Checked items below are the Android shell in this branch. Unchecked items need Android Studio, a device, or Play Console. The iOS steps above are unchanged. Details are in `docs/ANDROID.md`.

- [x] Capacitor Android project uses `com.youneek.proradar` and the display name YouNeeK Pro Radar.
- [x] Location is while-in-use only (`ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION`). No background location, and GPS is not required to install the app.
- [x] Help Me and I’m Sheltering stay user-tap-Send drafts. Android opens one `sms:` draft. The manifest does not grant the app the ability to send texts on its own. Contacts stay on device, and Android backup of those preferences is off.
- [x] The iOS review link also opens on Android: `youneekproradar://safety-preview`.
- [ ] `npm run build:android`, then a signed release AAB from Android Studio. Not verified here. Android Studio is not available in this environment.
- [ ] Location allow, location deny, airplane mode, Help Me, and I’m Sheltering on a real phone. See the device checklist in `docs/ANDROID.md`.
- [ ] Play Console app with package name `com.youneek.proradar`, Play App Signing, internal testing, then production.
- [ ] Data safety form matches `docs/APP_STORE.md`. No ads and no advertising id. Privacy policy URL is the same `/privacy` page as iOS. Add Android to that page's wording before review if you want the public text to name both apps.
