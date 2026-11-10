# Launch checklist

Checked items are done in this branch. Unchecked items need a Mac, a device, or App Store Connect.

## Before TestFlight

- [ ] Builds and runs on a real iPhone. Not verified here. Xcode is not available in this environment. See `docs/IOS.md`.
- [x] Location permission copy is specific and When In Use only (`NSLocationWhenInUseUsageDescription`).
- [ ] Location prompt, allow, and deny are confirmed on a device. The app has a city/ZIP search and an Open Settings path. See the device checklist in `docs/IOS.md`.
- [x] Radar status line includes a frame clock and "updated X min ago" when a frame time is known. Live frames use the latest RainViewer past frame. The line is the existing status pill, not a new panel.
- [ ] Alerts appear correctly on a device during a real warning.
- [x] Shelter SMS draft includes latitude, longitude, an Apple Maps link, and a Google Maps link. The user taps Send. No automatic or repeat send.
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

Use these values:

| Field | Value |
| --- | --- |
| Name | YouNeeK Pro Radar |
| Bundle ID | com.youneek.proradar |
| SKU | youneek-pro-radar-ios |
| Subtitle | Live radar and storm alerts |
| Primary category | Weather |
| Privacy policy URL | https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy |
| Support URL | https://youneekproradar.com |
| Price | One-time price in Pricing and Availability. Set the tier there, including free. There is no in-app purchase in this repo. |

Promotional text (optional, 170 characters):

> Live radar, severe-weather alerts, and a message you send yourself when a warning covers your location.

Description:

> YouNeeK Pro Radar is a dark, full-screen weather radar for your area.
>
> See live radar, how long ago the frame updated, and when rain is due. Severe warnings that cover your location can show Help Me and I'm Safe. Those buttons open a text you review and send yourself. The draft can include your coordinates and a map link. Contacts stay on your device.
>
> Forecasts use Apple WeatherKit when it is available, with Open-Meteo and National Weather Service alerts filling in. Location is used only while the app is open. The app does not track you across other companies' apps.

Keywords (100 characters, no spaces after commas):

> radar,weather,storm,tornado,alerts,forecast,nexrad,lightning,hurricane,noaa

Privacy labels: follow `docs/APP_STORE.md`. Do not turn on tracking.

Age rating: complete the questionnaire in Connect. Do not add ads or a web browser to change the answers.

Screenshots: capture on a Mac. Use the sizes App Store Connect lists for the current iPhone. This repo does not include them.

Submit: select the uploaded build, answer export compliance (the app only uses HTTPS; `ITSAppUsesNonExemptEncryption` is false), and submit for review. Paste the review notes from `docs/APP_STORE.md`.
