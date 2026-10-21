import { Link } from "react-router-dom";
import { ChevronRight, ShieldAlert } from "lucide-react";

export default function AlertBanner({ alerts = [] }) {
  if (!alerts.length) return null;
  const top = alerts[0];
  const severe = /warning|tornado|hurricane/i.test(`${top.name} ${top.severity}`);

  return (
    <Link
      to="/Briefing"
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        severe ? "bg-red-500 text-white" : "bg-amber-400 text-slate-950"
      }`}
    >
      <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{top.name}</div>
        <div className="truncate text-xs opacity-80">
          {alerts.length === 1 ? "Tap for details" : `${alerts.length} alerts · tap for details`}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link>
  );
}
