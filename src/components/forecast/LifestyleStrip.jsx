import { Link } from "react-router-dom";
import { coldFluRisk, outdoorScores, scoreLabel } from "@/lib/weather/lifestyle";

export default function LifestyleStrip({ current, environment }) {
  const sports = outdoorScores(current, environment).slice(0, 3);
  const flu = coldFluRisk(current, environment);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Outdoor & health
        </h2>
        <Link to="/Health" className="text-[11px] text-sky-300">
          Full guide
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Cold & flu</div>
          <div className="mt-1 text-lg font-semibold text-white">{flu.label}</div>
          <div className="text-[11px] text-slate-400">Risk {flu.score}</div>
        </div>
        {sports.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
            <div className="mt-1 text-lg font-semibold text-white">{item.score}</div>
            <div className="text-[11px] text-slate-400">{scoreLabel(item.score)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
