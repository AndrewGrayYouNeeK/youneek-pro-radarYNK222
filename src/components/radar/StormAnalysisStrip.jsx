
import { Activity, Radio, ShieldAlert, Zap } from "lucide-react";

function AnalysisPill({ icon: Icon, label, value, tone = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/75 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function StormAnalysisStrip({ metrics }) {
  if (!metrics) return null;
  const isAlert = metrics.stormMode !== "Monitor";
  return (
    <div
      className="pointer-events-none absolute left-3 z-[1000] grid grid-cols-2 gap-2"
      style={{ top: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      <AnalysisPill
        icon={isAlert ? ShieldAlert : Activity}
        label="Status"
        value={metrics.stormMode}
        tone={isAlert ? "text-red-400" : "text-cyan-300"}
      />
      <AnalysisPill
        icon={isAlert ? Zap : Radio}
        label="Feed"
        value={metrics.refreshLabel}
        tone={isAlert ? "text-amber-300" : "text-emerald-300"}
      />
    </div>
  );
}