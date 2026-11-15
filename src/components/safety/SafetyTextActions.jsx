import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import LocationOffPrompt from "@/components/location/LocationOffPrompt";
import useLocationStatus from "@/hooks/useLocationStatus";
import { useLocation } from "@/lib/LocationContext";
import { hapticImpact } from "@/lib/native/haptics";
import { safetyPlaceName, sendContactTexts } from "@/lib/safety/sms";

export const IM_SAFE_LABEL = "I'm Safe";
export const NEED_HELP_LABEL = "I Need Help";

// One tap: build the text and open Messages. No confirm screen. The user taps Send.
export default function SafetyTextActions({ compact = false, coords = null, alertName = "", showLocationPrompt = true, onSent }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentWithoutLocation, setSentWithoutLocation] = useState(false);
  const { location, gpsFix } = useLocation();
  const locationStatus = useLocationStatus();

  const send = async (kind) => {
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await sendContactTexts({
        kind,
        coords: locationStatus.off ? null : gpsFix ? { latitude: gpsFix.lat, longitude: gpsFix.lon } : coords,
        alertName,
        place: location?.source === "search" ? "" : safetyPlaceName(location),
        lookupLocation: !locationStatus.off,
      });
      setSentWithoutLocation(Boolean(result.withoutLocation));
      onSent?.(result);
      if (result.mode === "share") {
        setStatus("Messages isn't available here, so the share sheet opened. Nothing was sent automatically.");
      } else {
        setStatus("Messages is open with your text. Tap Send.");
      }
    } catch (error) {
      setStatus(error?.code === "CANCELLED" ? "Nothing was sent." : error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"} data-safety-actions="true">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            hapticImpact();
            send("safe");
          }}
          disabled={busy}
          aria-label={IM_SAFE_LABEL}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {IM_SAFE_LABEL}
        </button>
        <button
          type="button"
          onClick={() => {
            hapticImpact();
            send("emergency");
          }}
          disabled={busy}
          aria-label={NEED_HELP_LABEL}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          {NEED_HELP_LABEL}
        </button>
      </div>
      {showLocationPrompt && (locationStatus.off || sentWithoutLocation) && (
        <LocationOffPrompt variant="inline" force={sentWithoutLocation} />
      )}
      {status && <p className="w-fit rounded-lg bg-slate-950/85 px-2 py-1 text-xs text-slate-300">{status}</p>}
    </div>
  );
}
