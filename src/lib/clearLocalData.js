const APP_STORAGE_KEYS = [
  "onboarded_v1",
  "pref_notifyRain",
  "pref_notifyTornado",
  "pref_notifyLightning",
  "pref_notifyPollen",
  "pref_notifyAqi",
  "pref_notifyPrecip24",
  "pref_autoTune",
  "user_location_v1",
  "ynk_units_v1",
  "ynk_saved_locations_v1",
  "shelterContacts_v2",
  "shelterContacts",
];

export function clearLocalData() {
  APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
