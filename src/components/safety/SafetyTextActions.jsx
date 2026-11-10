import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { hapticImpact } from "@/lib/native/haptics";
import { SAFETY_EXPLAINED_KEY, safetyMessageExplanation, sendContactTexts } from "@/lib/safety/sms";

function hasSeenExplanation() {
  try {
    return window.localStorage.getItem(SAFETY_EXPLAINED_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberExplanation() {
  try {
    window.localStorage.setItem(SAFETY_EXPLAINED_KEY, "1");
  } catch {
    /* private mode */
  }
}

export default function SafetyTextActions({ compact = false, coords = null }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingKind, setPendingKind] = useState("");

  const send = async (kind) => {
    if (busy) return;
    if (!hasSeenExplanation()) {
      setPendingKind(kind);
      setStatus("");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const result = await sendContactTexts({ kind, coords });
      if (result.mode === "share") {
        setStatus("Messages isn't available on this device. Use the share sheet to send the message yourself. Nothing was sent automatically.");
      } else if (result.count === 1) {
        setStatus("Messages should be open with one draft. Tap Send there. Nothing is sent until you do.");
      } else {
        setStatus(`Messages should be open with one draft for ${result.count} contacts. Tap Send there. Nothing is sent until you do.`);
      }
    } catch (error) {
      setStatus(error?.code === "CANCELLED" ? "Nothing was sent." : error.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmExplanation = async () => {
    const kind = pendingKind;
    rememberExplanation();
    setPendingKind("");
    if (kind) await send(kind);
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {pendingKind ? (
        <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950/80 p-3">
          <p className="text-xs leading-relaxed text-slate-200">{safetyMessageExplanation()}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPendingKind("")}
              className="min-h-11 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmExplanation}
              className="min-h-11 rounded-xl bg-sky-500 px-3 py-2 text-sm font-bold text-slate-950"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
          <button
            type="button"
            onClick={() => {
              hapticImpact();
              send("emergency");
            }}
            disabled={busy}
            aria-label="Help Me text"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
          >
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Help Me
          </button>
          <button
            type="button"
            onClick={() => {
              hapticImpact();
              send("safe");
            }}
            disabled={busy}
            aria-label="I’m Sheltering text"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          I’m Sheltering
          </button>
        </div>
      )}
      {status && <p className="text-xs text-slate-400">{status}</p>}
    </div>
  );
}
