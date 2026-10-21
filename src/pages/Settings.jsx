import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { clearLocalData } from "@/lib/clearLocalData";
import BottomTab from "@/components/radar/BottomTab";
import AppHeader from "@/components/mobile/AppHeader";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import SafetyContactsLink from "@/components/safety/SafetyContactsLink";
import SafetyReminderCard from "@/components/safety/SafetyReminderCard";
import SafetyTextCard from "@/components/safety/SafetyTextCard";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Radio, Bell, Shield, Info, Trash2, AlertTriangle, Gauge, Zap, CloudSun } from "lucide-react";
import { getPref, setPref } from "@/lib/prefs";
import { UNIT_OPTIONS } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";

const APP_VERSION = "1.0.0";

function weatherKitStatusLabel(status) {
  if (!status) return "Checking whether Apple accepts the WeatherKit token…";
  switch (status.auth) {
    case "ok":
      return "Auth works. Current, hourly, daily, and alerts prefer WeatherKit, with Open-Meteo filling gaps.";
    case "missing":
      return status.missing?.length
        ? `Secrets missing: ${status.missing.join(", ")}. Forecast is using Open-Meteo and NWS.`
        : "Secrets are missing. Forecast is using Open-Meteo and NWS.";
    case "invalid_key":
      return "The .p8 key could not be signed. Forecast is using Open-Meteo and NWS.";
    case "rejected":
      return `Apple returned ${status.appleStatus || "an error"}. Forecast is using Open-Meteo and NWS.`;
    case "unreachable":
      return "Could not reach Apple. Forecast is using Open-Meteo and NWS.";
    default:
      return "WeatherKit status is unknown. Forecast is using Open-Meteo and NWS.";
  }
}

function Section({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="border-b border-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, sublabel, right, onClick, danger }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        onClick ? "hover:bg-white/5 active:bg-white/10" : "cursor-default"
      } ${danger ? "text-red-300" : "text-white"}`}
    >
      {Icon && (
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-red-950/60" : "bg-white/10"}`}>
          <Icon className={`h-4 w-4 ${danger ? "text-red-400" : "text-slate-300"}`} aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-tight">{label}</div>
        {sublabel && <div className="mt-0.5 text-xs leading-snug text-slate-400">{sublabel}</div>}
      </div>
      {right !== undefined ? (
        <div className="shrink-0">{right}</div>
      ) : onClick ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      ) : null}
    </Tag>
  );
}

export default function Settings() {
  useTabPageMemory("More");
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { units, setUnits } = useUnits();
  const [notifyRain, setNotifyRain] = useState(() => localStorage.getItem("pref_notifyRain") !== "false");
  const [notifyTornado, setNotifyTornado] = useState(() => localStorage.getItem("pref_notifyTornado") !== "false");
  const [notifyLightning, setNotifyLightning] = useState(() => localStorage.getItem("pref_notifyLightning") !== "false");
  const [notifyPollen, setNotifyPollen] = useState(() => localStorage.getItem("pref_notifyPollen") !== "false");
  const [notifyAqi, setNotifyAqi] = useState(() => localStorage.getItem("pref_notifyAqi") !== "false");
  const [notifyPrecip24, setNotifyPrecip24] = useState(() => localStorage.getItem("pref_notifyPrecip24") !== "false");
  const [autoTune, setAutoTune] = useState(() => localStorage.getItem("pref_autoTune") !== "false");
  const [notifyHurricane, setNotifyHurricane] = useState(() => localStorage.getItem("pref_notifyHurricane") !== "false");
  const [browserAlerts, setBrowserAlerts] = useState(() => getPref("pref_browserAlerts", false));
  const [showAbout, setShowAbout] = useState(false);
  const [weatherKit, setWeatherKit] = useState(null);

  const handleToggle = (key, setter) => (val) => {
    setter(val);
    setPref(key, val);
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/weather-status")
      .then((response) => response.json())
      .then((body) => {
        if (!cancelled) setWeatherKit(body);
      })
      .catch(() => {
        if (!cancelled) setWeatherKit({ auth: "unreachable", ok: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      clearLocalData();
      window.location.href = "/";
    },
    onMutate: () => setConfirmingDelete(false),
  });

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 text-white">
      <AppHeader title="Settings" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-5">
        <div className="mx-auto max-w-md space-y-4">
          <SafetyTextCard />
          <SafetyReminderCard />
          <SafetyContactsLink />
          <Section title="Notifications">
            <SettingRow
              icon={Bell}
              label="Rain arrival alerts"
              sublabel="Heads-up before rain reaches your location"
              right={
                <Switch
                  checked={notifyRain}
                  onCheckedChange={handleToggle("pref_notifyRain", setNotifyRain)}
                  aria-label="Toggle rain arrival alerts"
                />
              }
            />
            <SettingRow
              icon={Bell}
              label="Browser notifications"
              sublabel="While this tab is open, show a notification for a new NWS alert. Background push is not available."
              right={
                <Switch
                  checked={browserAlerts}
                  onCheckedChange={async (value) => {
                    if (value && typeof Notification !== "undefined") {
                      const permission = await Notification.requestPermission();
                      if (permission !== "granted") {
                        setBrowserAlerts(false);
                        setPref("pref_browserAlerts", false);
                        return;
                      }
                    }
                    setBrowserAlerts(value);
                    setPref("pref_browserAlerts", value);
                  }}
                  aria-label="Toggle browser notifications"
                />
              }
            />
            <SettingRow
              icon={AlertTriangle}
              label="Tornado & severe weather"
              sublabel="Show the shelter card when warnings are active"
              right={
                <Switch
                  checked={notifyTornado}
                  onCheckedChange={handleToggle("pref_notifyTornado", setNotifyTornado)}
                  aria-label="Toggle tornado warning alerts"
                />
              }
            />
            <SettingRow
              icon={Zap}
              label="Lightning proximity"
              sublabel="Spark-style heads-up when strikes are nearby"
              right={
                <Switch
                  checked={notifyLightning}
                  onCheckedChange={handleToggle("pref_notifyLightning", setNotifyLightning)}
                  aria-label="Toggle lightning proximity alerts"
                />
              }
            />
            <SettingRow
              icon={Bell}
              label="Next 24-hour precipitation"
              sublabel="Daily rain/snow outlook on Forecast"
              right={
                <Switch
                  checked={notifyPrecip24}
                  onCheckedChange={handleToggle("pref_notifyPrecip24", setNotifyPrecip24)}
                  aria-label="Toggle 24-hour precipitation alerts"
                />
              }
            />
            <SettingRow
              icon={Bell}
              label="Pollen notices"
              sublabel="Keep pollen detail visible on Forecast"
              right={
                <Switch
                  checked={notifyPollen}
                  onCheckedChange={handleToggle("pref_notifyPollen", setNotifyPollen)}
                  aria-label="Toggle pollen notices"
                />
              }
            />
            <SettingRow
              icon={AlertTriangle}
              label="Tropical cyclone notices"
              sublabel="Show a banner on Forecast when NHC is tracking a storm"
              right={
                <Switch
                  checked={notifyHurricane}
                  onCheckedChange={handleToggle("pref_notifyHurricane", setNotifyHurricane)}
                  aria-label="Toggle tropical cyclone notices"
                />
              }
            />
            <SettingRow
              icon={Bell}
              label="Air quality notices"
              sublabel="Keep AQI detail visible on Forecast"
              right={
                <Switch
                  checked={notifyAqi}
                  onCheckedChange={handleToggle("pref_notifyAqi", setNotifyAqi)}
                  aria-label="Toggle air quality notices"
                />
              }
            />
          </Section>

          <Section title="Appearance">
            <SettingRow
              icon={CloudSun}
              label="Dark mode"
              sublabel="The app stays in the dark theme so radar and nighttime text stay readable."
            />
          </Section>

          <Section title="Weather data">
            <SettingRow
              icon={CloudSun}
              label="Apple WeatherKit"
              sublabel={weatherKitStatusLabel(weatherKit)}
            />
          </Section>

          <Section title="Units">
            {Object.entries(UNIT_OPTIONS).map(([key, options]) => (
              <SettingRow
                key={key}
                icon={Gauge}
                label={key === "temp" ? "Temperature" : key === "wind" ? "Wind" : key === "pressure" ? "Pressure" : "Precipitation"}
                sublabel="Included — same options as WeatherBug premium"
                right={
                  <select
                    value={units[key]}
                    onChange={(event) => setUnits({ [key]: event.target.value })}
                    aria-label={`Choose ${key} unit`}
                    className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
              />
            ))}
          </Section>

          <Section title="NOAA Radio">
            <SettingRow
              icon={Radio}
              label="Auto-tune nearest station"
              sublabel="Select the closest NOAA station on startup"
              right={
                <Switch
                  checked={autoTune}
                  onCheckedChange={handleToggle("pref_autoTune", setAutoTune)}
                  aria-label="Toggle auto-tune nearest station"
                />
              }
            />
          </Section>

          <Section title="About">
            <SettingRow
              icon={Info}
              label="YouNeeK Pro Radar"
              sublabel={`Version ${APP_VERSION} — by Andrew Gray`}
              onClick={() => setShowAbout((v) => !v)}
              right={<ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${showAbout ? "rotate-90" : ""}`} />}
            />
            {showAbout && (
              <div className="space-y-2 px-4 pb-4 pt-1 text-xs leading-relaxed text-slate-400">
                <p>
                  Included with the app: live NEXRAD, global + future radar, 3D radar globe, lightning
                  proximity, tropical cyclones, wildfires, satellite, NOAA Weather Radio, Emergency and
                  I&apos;m Safe texts, 168-hour / 16-day forecasts, minute precipitation, AQI, pollen, UV,
                  SPC storm risk, hurricane and fire centers, and unit conversion. Every WeatherBug-class
                  premium layer ships unlocked.
                </p>
                <p className="text-slate-500">
                  Data sources: Iowa Mesonet · RainViewer · NHC · api.weather.gov · Apple WeatherKit · Open-Meteo
                </p>
                <p className="text-slate-500">© 2026 Andrew Gray · YouNeeK</p>
              </div>
            )}
            <SettingRow
              icon={Shield}
              label="Privacy"
              sublabel="Location stays on-device except to fetch weather"
              onClick={() => navigate("/Privacy")}
            />
            <SettingRow
              icon={Info}
              label="Re-run app walkthrough"
              sublabel="See the intro guide again"
              onClick={() => {
                localStorage.removeItem("onboarded_v1");
                window.location.reload();
              }}
            />
          </Section>

          <Section title="Data">
            {!confirmingDelete ? (
              <SettingRow
                icon={Trash2}
                label="Clear all app data"
                sublabel="Removes saved preferences from this device"
                onClick={() => setConfirmingDelete(true)}
                danger
              />
            ) : (
              <div className="space-y-3 p-4">
                <p className="text-sm leading-snug text-red-200">This removes all data stored on this device.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    aria-label="Cancel data clear"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => clearDataMutation.mutate()}
                    aria-label="Confirm data clear"
                    disabled={clearDataMutation.isPending}
                    className="flex-1 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {clearDataMutation.isPending ? "Clearing…" : "Clear Data"}
                  </button>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
