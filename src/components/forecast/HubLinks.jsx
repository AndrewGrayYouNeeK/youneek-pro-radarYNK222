import { Link } from "react-router-dom";
import { Flame, Newspaper, Orbit, RadioTower } from "lucide-react";

const LINKS = [
  { to: "/Hurricanes", label: "Hurricane Center", detail: "Live NHC tracks", icon: RadioTower },
  { to: "/Fires", label: "Fire Center", detail: "VIIRS + EONET", icon: Flame },
  { to: "/Briefing", label: "Weather briefing", detail: "Outlooks & local alerts", icon: Newspaper },
  { to: "/More", label: "More toolkit", detail: "AQI, pollen, cameras, news", icon: Orbit },
  { to: "/Globe", label: "3D radar globe", detail: "Live + future radar", icon: Orbit },
];

export default function HubLinks() {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        More than WeatherBug
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10"
            >
              <Icon className="h-4 w-4 text-cyan-300" />
              <div className="mt-2 text-sm font-semibold text-white">{item.label}</div>
              <div className="text-[11px] text-slate-400">{item.detail}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
