import { Lock } from "lucide-react";
import { GET_APP_URL, PREMIUM_LABEL } from "@/lib/premium";

/** Small "Premium in the app · Get the App" pill for the free web preview. */
export default function PremiumPill({ className = "" }) {
  return (
    <a
      href={GET_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-premium-pill="web"
      className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-slate-950/90 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 shadow ${className}`}
    >
      <Lock className="h-3 w-3" aria-hidden="true" />
      {PREMIUM_LABEL}
      <span className="text-white/50" aria-hidden="true">·</span>
      <span className="text-white">Get the App</span>
    </a>
  );
}
