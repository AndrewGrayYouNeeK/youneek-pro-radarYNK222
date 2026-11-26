import useNotificationStatus from "@/hooks/useNotificationStatus";

const SUBLABEL = {
  granted: "On. Tornado, Severe Thunderstorm, and Flash Flood Warnings for your area reach this phone, even when the app is closed.",
  denied: "Off. Notifications are blocked for this app. Turn them on in Settings to get warnings when the app is closed.",
  prompt: "Off. Turn on to get Tornado, Severe Thunderstorm, and Flash Flood Warnings for your area, even when the app is closed.",
  unknown: "Checking notification permission…",
};

/** Settings row for live warning notifications. Row is the page's own SettingRow component. */
export default function LockScreenAlertsRow({ Row, icon }) {
  const { permission, busy, turnOn } = useNotificationStatus();
  const action = permission === "denied" ? "Open Settings" : permission === "prompt" ? "Turn on" : "";
  return (
    <Row
      icon={icon}
      label="Lock screen alerts"
      sublabel={SUBLABEL[permission] || SUBLABEL.unknown}
      right={
        action ? (
          <button
            type="button"
            onClick={turnOn}
            disabled={busy}
            className="shrink-0 rounded-lg border border-emerald-400/60 bg-emerald-400/15 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-200 disabled:opacity-50"
          >
            {action}
          </button>
        ) : null
      }
    />
  );
}
