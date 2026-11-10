import { Play, Pause } from "lucide-react";
import { LOOP_FRAME_COUNTS } from "@/lib/radar/loopFrames";

export default function TimeLapseBar({
  enabled,
  playing,
  onToggleEnabled,
  onTogglePlaying,
  frameLabel,
  speed,
  onSpeedChange,
  frameCount = 8,
  onFrameCountChange,
  onRetry,
}) {
  return (
    <div className="pointer-events-auto flex max-w-[calc(100%-3.75rem)] flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={onToggleEnabled}
        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
          enabled ? "bg-cyan-500/20 text-cyan-200" : "bg-white/5 text-slate-400"
        }`}
      >
        Loop
      </button>
      <button
        type="button"
        onClick={onTogglePlaying}
        disabled={!enabled}
        aria-label={playing ? "Pause radar loop" : "Play radar loop"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-40"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
      </button>
      <div className="min-w-[4.5rem] text-center text-[11px] tabular-nums text-slate-300">{frameLabel || "Live"}</div>
      <select
        value={speed}
        onChange={(event) => onSpeedChange(Number(event.target.value))}
        disabled={!enabled}
        aria-label="Radar loop speed"
        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-white disabled:opacity-40"
      >
        <option value={800}>Slow</option>
        <option value={400}>Med</option>
        <option value={180}>Fast</option>
      </select>
      <select
        value={frameCount}
        onChange={(event) => onFrameCountChange?.(Number(event.target.value))}
        disabled={!enabled}
        aria-label="Radar loop frame count"
        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-white disabled:opacity-40"
      >
        {LOOP_FRAME_COUNTS.map((count) => (
          <option key={count} value={count}>
            {count}
          </option>
        ))}
      </select>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-amber-200">
          Retry
        </button>
      )}
    </div>
  );
}
