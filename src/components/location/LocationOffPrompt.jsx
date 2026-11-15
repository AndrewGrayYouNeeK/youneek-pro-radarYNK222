import { useState } from "react";
import { MapPinOff, X } from "lucide-react";
import useLocationStatus from "@/hooks/useLocationStatus";
import {
  LOCATION_OFF_TEXT,
  LOCATION_PROMPT_DISMISS_KEY,
  promptSnoozed,
} from "@/lib/location/locationPrompt";

function readDismissed() {
  try {
    return promptSnoozed(window.localStorage.getItem(LOCATION_PROMPT_DISMISS_KEY));
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    window.localStorage.setItem(LOCATION_PROMPT_DISMISS_KEY, String(Date.now()));
  } catch {
    /* private mode */
  }
}

/**
 * variant "banner": small dismissible strip for the radar screen.
 * variant "inline": card for onboarding and next to the safety buttons. Not dismissible.
 * force: show when the screen saw a failed fix, unless permission is granted.
 * urgent: show even if the banner was dismissed (a safety text just went out without location).
 */
export default function LocationOffPrompt({
  variant = "inline",
  force = false,
  urgent = false,
  className = "",
  onDismiss,
  onGranted,
  children,
}) {
  const { off, note, busy, turnOn, state } = useLocationStatus({ onGranted });
  const [dismissed, setDismissed] = useState(() => (variant === "banner" ? readDismissed() : false));

  // force: the screen already knows a fix failed, but never claim "off" once permission is granted.
  const show = off || (force && state.permission !== "granted");
  if (!show || (dismissed && !urgent)) return null;

  const banner = variant === "banner";
  return (
    <div
      role="status"
      data-location-off-prompt={variant}
      className={`pointer-events-auto rounded-xl border border-emerald-400/40 bg-slate-950/90 font-mono text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.18)] backdrop-blur-md ${
        banner ? "px-3 py-2" : "p-3"
      } ${className}`}
    >
      <div className="flex items-start gap-2">
        <MapPinOff className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
        <p className={`min-w-0 flex-1 leading-snug ${banner ? "text-[11px]" : "text-xs"}`}>{LOCATION_OFF_TEXT}</p>
        {banner && (
          <button
            type="button"
            onClick={() => {
              rememberDismissed();
              setDismissed(true);
              onDismiss?.();
            }}
            aria-label="Dismiss location prompt"
            className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-300/70 hover:bg-emerald-400/10"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={turnOn}
        disabled={busy}
        className={`mt-2 w-full rounded-lg border border-emerald-400/60 bg-emerald-400/15 font-bold uppercase tracking-[0.14em] text-emerald-200 hover:bg-emerald-400/25 disabled:opacity-50 ${
          banner ? "min-h-9 text-[11px]" : "min-h-11 text-xs"
        }`}
      >
        Turn On Location
      </button>
      {children}
      {note && <p className="mt-2 text-[11px] leading-snug text-emerald-100/80">{note}</p>}
    </div>
  );
}
