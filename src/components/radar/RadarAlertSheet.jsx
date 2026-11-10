import LoadError from "@/components/LoadError";

function formatExpires(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) return "";
  return new Date(time).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function RadarAlertSheet({
  mode,
  warnings = [],
  selected,
  stale = false,
  error = false,
  onClose,
  onOpenList,
  onSelect,
  onRetry,
}) {
  return (
    <div
      className="pointer-events-auto absolute inset-x-3 z-[1250] flex max-h-[46vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl"
      style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-label={mode === "detail" ? "Warning text" : "Warning list"}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          {mode === "detail" ? selected?.event || "Warning" : "Warnings"}
        </div>
        <div className="flex items-center gap-2">
          {mode === "detail" && (
            <button type="button" onClick={onOpenList} className="text-xs font-semibold text-sky-300">
              All
            </button>
          )}
          <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-300">
            Close
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {stale && (
          <p className="mb-2 text-xs text-amber-200">Showing the last alerts saved on this device.</p>
        )}
        {error && <LoadError message="Alerts didn't load." onRetry={onRetry} />}
        {mode === "list" && warnings.length === 0 && !error && (
          <p className="text-sm text-slate-300">No active warnings right now.</p>
        )}
        {mode === "list" &&
          warnings.map((summary) => (
            <button
              key={summary.id}
              type="button"
              onClick={() => onSelect(summary)}
              className="mb-2 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left"
            >
              <div className="text-sm font-semibold text-white">{summary.event}</div>
              {summary.area && <div className="mt-0.5 line-clamp-2 text-xs text-slate-400">{summary.area}</div>}
            </button>
          ))}
        {mode === "detail" && selected && (
          <div className="space-y-2 text-sm text-slate-200">
            {selected.headline && <p className="font-semibold text-white">{selected.headline}</p>}
            <p className="text-xs text-slate-400">
              {[selected.sender, selected.severity, selected.area, formatExpires(selected.expires) && `Until ${formatExpires(selected.expires)}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {selected.description ? (
              <p className="whitespace-pre-wrap text-xs leading-relaxed">{selected.description}</p>
            ) : (
              <p className="text-xs text-slate-400">The National Weather Service did not include a longer text for this warning.</p>
            )}
            {selected.instruction && (
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-amber-100">{selected.instruction}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
