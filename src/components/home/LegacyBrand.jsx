import { Link } from "react-router-dom";
import { Globe2, Radio, Radar } from "lucide-react";

const LINKS = [
  { to: "/Radar", label: "Launch radar", icon: Radar },
  { to: "/Radio", label: "NOAA radio", icon: Radio },
  { to: "/Globe", label: "3D globe", icon: Globe2 },
];

export default function LegacyBrand() {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#00ff9c]/30 bg-black">
      <img
        src="/neon/logo-1.png"
        alt="YouNeeK neon sign"
        className="h-44 w-full bg-black object-contain"
      />
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ff9c] shadow-[0_0_8px_#00ff9c]" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#00ff9c]">Making it rain</p>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">YouNeeK Pro Radar</h2>
          <p className="mt-1 text-xs text-white/60">
            By <span className="text-[#00ff9c]">Andrew Gray</span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-1 rounded-2xl border border-[#00ff9c]/25 bg-black px-2 py-2 text-center text-[11px] font-semibold text-[#00ff9c]"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
