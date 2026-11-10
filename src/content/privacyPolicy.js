export const PRIVACY_POLICY_UPDATED = "November 10, 2026";

export const PRIVACY_POLICY_PARAGRAPHS = [
  "YouNeeK Pro Radar shows radar and severe-weather alerts for a place you choose or for your current location. This policy covers the website and the iOS app.",
  "Precise location is used only to center the map, load forecasts, and decide whether a severe warning covers you so the Help Me and I’m Sheltering drafts can appear. On iOS the app asks for Location While Using the App. It does not ask for Always location and it does not track you in the background.",
  "When a forecast or alert is loaded, the latitude and longitude are sent to our Cloudflare Worker at youneek-pro-radarynk222.youneekartifacts.workers.dev. That Worker asks Apple WeatherKit and the National Weather Service for data for that point. The app also sends the same coordinates directly to Open-Meteo for forecast fields WeatherKit does not fill. City and ZIP searches are sent to those geocoders so we can turn the name into coordinates. Radar pictures come from RainViewer and Iowa State University's Mesonet; the map view those tile requests reveal is the area on screen, not a saved location profile. Hurricane and wildfire feeds are loaded without your coordinates.",
  "We do not run analytics, advertising, or attribution SDKs. We do not use Apple's App Tracking Transparency prompt, the advertising identifier, or any third-party tracker. The Worker does not keep an account for you and does not store your location in a database we control.",
  "Safety contacts and the Help Me / I’m Sheltering wording stay on this device (iOS Preferences, or the browser's local storage on the website). They are not uploaded. Tapping Help Me or I’m Sheltering opens a message you can read. I’m Sheltering says you are sheltering and safe, and includes your exact coordinates and a Google Maps link. The message is sent only if you tap Send in Messages or in the share sheet. The app does not send it for you and does not resend it.",
  "WeatherKit credentials stay on the Cloudflare Worker. They are not in the app.",
  "You can clear contacts, saved places, and settings in the app with Clear all app data, or by deleting the app. You can turn location off in iOS Settings.",
  "Questions about this policy: https://youneekproradar.com",
];
