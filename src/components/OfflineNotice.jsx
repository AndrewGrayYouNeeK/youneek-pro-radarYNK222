import useOnline from "@/hooks/useOnline";

export default function OfflineNotice({ compact = false }) {
  const online = useOnline();
  if (online) return null;
  return (
    <p
      className={
        compact
          ? "pointer-events-none rounded-full bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-200 shadow"
          : "rounded-2xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs leading-relaxed text-slate-300"
      }
      role="status"
    >
      You&apos;re offline. Saved places stay on this device. Radar and forecasts load again when the connection is back.
    </p>
  );
}
