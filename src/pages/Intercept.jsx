import { useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";

function readTargets() {
  try {
    const parsed = JSON.parse(localStorage.getItem("radarTargets") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Intercept() {
  const [targets, setTargets] = useState(readTargets);
  const [name, setName] = useState("");
  const [bearing, setBearing] = useState("0");
  const [range, setRange] = useState("10");

  const addTarget = (event) => {
    event.preventDefault();
    const next = [
      ...targets,
      {
        id: Date.now().toString(),
        name: name.trim() || "Target",
        bearing: Number(bearing),
        range: Number(range),
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("radarTargets", JSON.stringify(next));
    setTargets(next);
    setName("");
  };

  const remove = (id) => {
    const next = targets.filter((target) => target.id !== id);
    localStorage.setItem("radarTargets", JSON.stringify(next));
    setTargets(next);
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Storm intercept" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <div className="mx-auto max-w-md space-y-4">
          <p className="text-sm text-slate-300">
            Saved intercept targets stay on this device. The radar map itself stays clear.
          </p>
          <form onSubmit={addTarget} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="block text-xs text-slate-400">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                placeholder="Cell north of town"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs text-slate-400">
                Bearing
                <input
                  value={bearing}
                  onChange={(event) => setBearing(event.target.value)}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-slate-400">
                Range (mi)
                <input
                  value={range}
                  onChange={(event) => setRange(event.target.value)}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
            <button type="submit" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950">
              Save target
            </button>
          </form>
          {targets.map((target) => (
            <div key={target.id} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">{target.name || target.callsign || "Target"}</div>
                <div className="text-xs text-slate-400">
                  {target.bearing != null ? `${Math.round(Number(target.bearing))}°` : ""}{" "}
                  {target.range != null ? `${target.range} mi` : ""}
                </div>
              </div>
              <button type="button" onClick={() => remove(target.id)} className="text-sm text-red-300">
                Remove
              </button>
            </div>
          ))}
          {!targets.length && <p className="text-sm text-slate-400">No saved targets yet.</p>}
          <Link to="/Radar" className="inline-block text-sm font-medium text-sky-300">
            Open radar
          </Link>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
