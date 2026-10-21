const APP_STORAGE_KEYS = [
  "onboarded_v1",
  "pref_notifyRain",
  "pref_notifyTornado",
  "pref_notifyLightning",
  "pref_notifyPollen",
  "pref_notifyAqi",
  "pref_notifyPrecip24",
  "pref_notifyHurricane",
  "pref_autoTune",
  "mapDesk_v2",
  "weatherEmergency_v1",
  "ynk_active_location_v1",
  "younk_pro_radar_settings_v1",
  "younk_radar_location_v1",
  "younk_sos_profile_v1",
  "user_location_v1",
  "ynk_units_v1",
  "ynk_saved_locations_v1",
  "shelterContacts_v2",
  "shelterContacts",
  "radarLayers_v1",
  "pref_browserAlerts",
  "radarTargets",
];

export function clearLocalData() {
  APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
