import { CalendarRange, Clock3, CloudSun, LayoutGrid, Radar } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNavigationStack } from "@/lib/NavigationStack";

const TABS = [
  { label: "Now", path: "/", icon: CloudSun },
  { label: "Hourly", path: "/Hourly", icon: Clock3 },
  { label: "10-Day", key: "Daily", path: "/Daily", icon: CalendarRange },
  { label: "Radar", path: "/Radar", icon: Radar },
  { label: "More", path: "/More", icon: LayoutGrid },
];

const MORE_PREFIXES = [
  "/More",
  "/Contacts",
  "/AirQuality",
  "/Pollen",
  "/Lightning",
  "/Hurricanes",
  "/Fires",
  "/Briefing",
  "/Cameras",
  "/Wildfire",
  "/Health",
  "/News",
  "/Astronomy",
  "/Radio",
  "/Forecast",
  "/Globe",
  "/Settings",
  "/Privacy",
  "/Intercept",
  "/MapLayers",
];

export default function BottomTab() {
  const location = useLocation();
  const { navigateToTab, resetTab } = useNavigationStack();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[1800] select-none border-t border-white/10 bg-slate-950/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center justify-around px-2 py-1.5">
        {TABS.map(({ label, path, icon: Icon, key }) => {
          const tabKey = key || label;
          const active =
            location.pathname === path ||
            (path === "/More" && MORE_PREFIXES.some((item) => location.pathname.startsWith(item)));
          return (
            <button
              key={path}
              type="button"
              onClick={() => {
                if (active) resetTab(tabKey);
                else navigateToTab(tabKey);
              }}
              aria-label={`Open ${label}`}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-xs font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
