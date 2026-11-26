import { useState } from "react";
import { BellOff, X } from "lucide-react";
import useNotificationStatus from "@/hooks/useNotificationStatus";
import { NOTIFICATIONS_OFF_TEXT, NOTIFY_PROMPT_DISMISS_KEY, promptSnoozed } from "@/lib/push/pushClient";

function readDismissed() {
  try {
    return promptSnoozed(window.localStorage.getItem(NOTIFY_PROMPT_DISMISS_KEY));
  } catch {
    return false;
  }
}

/** Small dismissible strip on the radar when the phone blocks notifications (native only). */
export default function NotificationsOffPrompt({ className = "" }) {
  const { off, busy, turnOn } = useNotificationStatus();
  const [dismissed, setDismissed] = useState(() => readDismissed());
  if (!off || dismissed) return null;

  return (
    <div
      role="status"
      data-notifications-off-prompt="banner"
      className={`pointer-events-auto rounded-xl border border-emerald-400/40 bg-slate-950/90 px-3 py-2 font-mono text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.18)] backdrop-blur-md ${className}`}
    >
      <div className="flex items-start gap-2">
        <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-[11px] leading-snug">{NOTIFICATIONS_OFF_TEXT}</p>
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.setItem(NOTIFY_PROMPT_DISMISS_KEY, String(Date.now()));
            } catch {
              /* private mode */
            }
            setDismissed(true);
          }}
          aria-label="Dismiss notifications prompt"
          className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-300/70 hover:bg-emerald-400/10"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        onClick={turnOn}
        disabled={busy}
        className="mt-2 min-h-9 w-full rounded-lg border border-emerald-400/60 bg-emerald-400/15 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200 hover:bg-emerald-400/25 disabled:opacity-50"
      >
        Open Settings
      </button>
    </div>
  );
}
