# App Store listing

Paste these fields into App Store Connect. The same bytes are in `fastlane/metadata/en-US/` (`name.txt`, `subtitle.txt`, `promotional_text.txt`, `description.txt`, `keywords.txt`, `release_notes.txt`, `primary_category.txt`, `secondary_category.txt`, `privacy_url.txt`, `support_url.txt`).

Character limits, checked by `functions/_lib/app-store-listing.test.js`: name 17/30, subtitle 24/30, promotional text 143/170, keywords 82/100.

Do not edit the listing text below to match the app. The note under Suggested review-safe wording is the only place that proposes a change.

## Name

YouNeeK Pro Radar

## Subtitle

Tactical NEXRAD & Alerts

## Promotional text

Live NEXRAD radar, real NWS warning polygons, and one-tap I’m Safe and I Need Help texts that share your location. Ad-free. One-time purchase.

## Description

YouNeeK Pro Radar is a tactical weather radar app built for people who actually watch the sky.

LIVE NEXRAD RADAR
National base reflectivity mosaics from Iowa Mesonet, refreshed automatically. See storms as they develop.

NWS WARNING POLYGONS
Tornado, severe thunderstorm, flood, and winter warnings drawn as real shapes on the map — not just text lists.

SAFETY CONTACTS: I’M SAFE & I NEED HELP
Pick the people to text the first time you open the app. When a tornado or severe weather warning or watch covers you, tap I’m Safe or I Need Help to open a ready-to-send text with your location and a map link. You review it and tap Send. Contacts stay on your device.

NOAA WEATHER RADIO
Finds the nearest NOAA Weather Radio station and shows its call sign and frequency so you can tune your weather radio.

CLEAN & FOCUSED
Dark tactical interface. No ads. No subscriptions. One-time purchase.

Built for storm watchers, weather enthusiasts, and anyone who wants radar and safety in the same place.

## Keywords

radar,nexrad,weather,storm,tornado,severe,alert,nws,shelter,tactical,weather radio

## Categories

Primary: Weather (`WEATHER`). Secondary, optional: Navigation (`NAVIGATION`).

## What’s New 1.0

Initial release. • Live NEXRAD radar • NWS alert polygons • Storm distance and rain-in-minutes • Safety contacts set up on first launch • I’m Safe and I Need Help texts with your location • NOAA Weather Radio station finder • Dark tactical interface • Ad-free, one-time purchase

## Age rating and price

Age rating: 4+. Price: one-time purchase, no subscription. Set the tier in App Store Connect. There is no in-app purchase in this repo.

## URLs

Privacy policy: https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy

Support: https://youneekproradar.com/support

Support email: andrewgray@youneek.xyz

## Review-safe wording

The listing above already says the user reviews the draft and taps Send. On iOS, I’m Safe and I Need Help do not send the text by themselves. The buttons open Messages (or the share sheet) with the draft filled in, and the user taps Send.

## Screenshot shot list

Capture on a Mac from a device or simulator, in the dark UI, at the sizes App Store Connect asks for. Nothing here adds chrome to the radar map.

1. Full radar with reflectivity and location. Open the Radar tab. Allow location. The map starts on the Iowa Mesonet national base reflectivity mosaic (Layers → NEXRAD site says National mosaic). Tap the locate button if the marker is not on you. The status pill shows the product and how old the frame is.

2. Radar with NWS warning polygons. Stay on Radar. Open Layers and turn on Warnings: Tornado, Severe, Flood, and Winter (those four start on). Polygons draw only when the National Weather Service has an active warning of that type, so take this shot while one of those warnings is active. They are the real NWS shapes, not a text list.

3. I’m Safe and I Need Help buttons. Add at least one contact (the first screen on first launch, or More → Contacts). Then open `youneekproradar://safety-preview` on the phone, or on the website add `?safetyPreview=Tornado%20Warning`. The card is labeled Simulated alert. It appears on Now and, when a warning covers the location, on Radar. Tap I’m Safe once to show the ready-to-send draft with your location and a map link. Cancel if you do not want Messages to open. Turn the preview off with `youneekproradar://open?safetyPreview=0` or `?safetyPreview=0`.

4. Current conditions and hourly. Open the Now tab with a location set. The screen shows current conditions and the hourly strip.

5. Alert list or detail. With an active alert, the Now screen shows the alert banner. More → Weather briefing lists the alerts for the selected place. Use whichever has text on the day you shoot.

6. Settings or contacts, optional. More → Contacts shows the saved safety contacts. More → Settings shows units, the privacy link, and the NOAA radio preference.

## What the listing claims, and what the app does

True in this build:

- Iowa Mesonet national base reflectivity mosaic (`nexrad-n0q-900913`) is the default radar, and the live layer reloads every five minutes while the loop is off. Pull to refresh still reloads it immediately.
- Individual radar sites are in Layers → NEXRAD site. Reflectivity, base velocity, and storm-relative velocity use that site’s Iowa Mesonet ridge tiles.
- Tornado, severe thunderstorm, flood, and winter warnings are NWS polygons on the map. Tornado, severe, flood, and winter start turned on.
- The interface is dark. There are no ads and no subscriptions.
- I’m Safe and I Need Help are the safety actions. They appear only when a warning or watch covers the location. Safety contacts are the first screen on first launch (skippable) and stay on the device. The draft includes exact coordinates and a map link (Apple Maps on iOS, Google Maps on Android). The user taps Send.
- The app shell and the last successful forecast and alert responses are cached for offline use (service worker, network-first, then the saved copy). Radar tiles are not stored as a full offline mosaic.

Not true if you read the listing literally:

- None open. The earlier “One tap sends” and “so you can listen” wording was removed from the listing. The Radio page selects the nearest NOAA Weather Radio transmitter and shows the call sign and frequency. There is no in-app audio player.
