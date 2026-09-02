import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";

export default function PageScaffold({ title, children }) {
  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <div className="mx-auto max-w-md space-y-4">{children}</div>
      </div>
      <BottomTab />
    </div>
  );
}

export function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
          <div className="mt-1 text-lg font-semibold text-white">{item.value ?? "—"}</div>
          {item.sub && <div className="mt-0.5 text-[11px] text-slate-400">{item.sub}</div>}
        </div>
      ))}
    </div>
  );
}
