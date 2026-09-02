import { Link } from "react-router-dom";
import { Camera, Flame, Newspaper, Zap } from "lucide-react";

const LINKS = [
  { to: "/Lightning", icon: Zap, label: "Lightning" },
  { to: "/Cameras", icon: Camera, label: "Cameras" },
  { to: "/Wildfire", icon: Flame, label: "Wildfires" },
  { to: "/News", icon: Newspaper, label: "News" },
];

export default function MoreShortcuts() {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Explore
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-[11px] text-slate-200"
            >
              <Icon className="h-4 w-4 text-sky-300" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
