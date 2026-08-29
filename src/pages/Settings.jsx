import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { clearLocalData } from "@/lib/clearLocalData";
import BottomTab from "@/components/radar/BottomTab";
import AppHeader from "@/components/mobile/AppHeader";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Radio, Bell, Shield, Info, Trash2, AlertTriangle } from "lucide-react";
import { setPref } from "@/lib/prefs";

const APP_VERSION = "1.0.0";

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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
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
    </button>
  );
}

export default function Settings() {
  useTabPageMemory("Settings");
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [notifyRain, setNotifyRain] = useState(() => localStorage.getItem("pref_notifyRain") !== "false");
  const [notifyTornado, setNotifyTornado] = useState(() => localStorage.getItem("pref_notifyTornado") !== "false");
  const [autoTune, setAutoTune] = useState(() => localStorage.getItem("pref_autoTune") !== "false");
  const [showAbout, setShowAbout] = useState(false);

  const handleToggle = (key, setter) => (val) => {
    setter(val);
    setPref(key, val);
  };

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      clearLocalData();
      window.location.href = "/landing";
    },
    onMutate: () => setConfirmingDelete(false),
  });

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 text-white">
      <AppHeader title="Settings" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-5">
        <div className="mx-auto max-w-md space-y-4">
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
                  Included with the app: live NEXRAD + radar loops, lightning reports, tropical cyclones,
                  satellite, NOAA Weather Radio, Emergency and I&apos;m Safe texts, WeatherKit forecasts, air quality,
                  and a 3D globe. No premium upsell.
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
