import { Link } from "react-router-dom";
import {
  Activity,
  Camera,
  Droplets,
  Flame,
  HeartPulse,
  Newspaper,
  Shield,
  Sparkles,
  SunMedium,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";

const ITEMS = [
  { to: "/AirQuality", icon: Wind, title: "Air quality", desc: "US AQI, PM2.5, ozone, and health guidance" },
  { to: "/Pollen", icon: Sparkles, title: "Pollen & allergy", desc: "Species breakdown and 3-day outlook" },
  { to: "/Lightning", icon: Zap, title: "Lightning map", desc: "Closest strikes and live storm reports" },
  { to: "/Hurricanes", icon: Activity, title: "Hurricane tracker", desc: "Active tropical cyclones from NHC" },
  { to: "/Cameras", icon: Camera, title: "Weather cameras", desc: "GOES sky views and public park webcams" },
  { to: "/Wildfire", icon: Flame, title: "Wildfire updates", desc: "Open fires from NASA EONET" },
  { to: "/Health", icon: HeartPulse, title: "Health & sports", desc: "UV, cold & flu risk, outdoor scores" },
  { to: "/News", icon: Newspaper, title: "Weather news", desc: "Live NWS headlines and safety notes" },
  { to: "/Astronomy", icon: SunMedium, title: "Sun & moon", desc: "Sunrise, sunset, and moon phase" },
  { to: "/Contacts", icon: Users, title: "Safety contacts", desc: "Emergency and I'm Safe text drafts" },
];

export default function More() {
  useTabPageMemory("More");

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="More" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <div className="mx-auto max-w-md space-y-4">
          <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/50 to-slate-950 p-4">
            <div className="flex items-center gap-2 text-cyan-200">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">All Pro features included</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Radar loops, future nowcast, lightning, hurricanes, 3D globe radar, air quality, pollen, cameras, and
              wildfires ship unlocked. No ads. No upsell.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{item.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
            <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
            Beyond WeatherBug: NOAA radio, SOS texts, storm intercept tools, and a 3D radar globe.
          </div>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
