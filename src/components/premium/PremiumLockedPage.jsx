import { Lock } from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import { GET_APP_URL, PREMIUM_FEATURES, PREMIUM_LABEL } from "@/lib/premium";

/** Full page shown on the web preview for app-only pages (Contacts, NOAA Radio). */
export default function PremiumLockedPage({ title }) {
  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 text-white" data-premium-locked="web">
      <AppHeader title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-28">
        <div className="mx-auto max-w-md rounded-2xl border border-emerald-400/30 bg-slate-900/80 p-5">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            {PREMIUM_LABEL}
          </p>
          <h1 className="mt-2 text-xl font-bold">{title} is in the YouNeeK Pro Radar app</h1>
          <p className="mt-2 text-sm text-slate-300">The website is a free preview. The app is $6.99 once, with everything unlocked:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <a
            href={GET_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-emerald-400 px-5 text-sm font-bold text-slate-950"
          >
            Get the App
          </a>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
