import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { sendContactTexts } from "@/lib/safety/sms";

export default function SafetyTextActions({ compact = false }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (kind) => {
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await sendContactTexts({
        kind,
        context: kind === "safe" ? "I'M SAFE — I am OK and accounted for." : undefined,
      });
      setStatus(`Opened ${result.count} message draft${result.count === 1 ? "" : "s"} — tap Send in Messages.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        <button
          type="button"
          onClick={() => send("emergency")}
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Emergency text
        </button>
        <button
          type="button"
          onClick={() => send("safe")}
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          I'm Safe text
        </button>
      </div>
      {status && <p className="text-xs text-slate-400">{status}</p>}
    </div>
  );
}
