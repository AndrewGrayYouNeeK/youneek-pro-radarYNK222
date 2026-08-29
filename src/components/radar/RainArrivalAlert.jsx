import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudRain, LoaderCircle, MapPin, X } from "lucide-react";
import { getPref } from "@/lib/prefs";
import { fetchRainAlert } from "@/lib/api/rainAlert";

function getAlertCopy(data) {
  if (!data) {
    return {
      title: "Checking for rain nearby",
      detail: "Pulling the latest short-range precipitation forecast.",
      tone: "border-white/10 bg-slate-950/85 text-white",
    };
  }

  if (data.status === "rain_now") {
    return {
      title: "Rain is starting now",
      detail: "Light precipitation is active at your location.",
      tone: "border-cyan-400/40 bg-cyan-950/80 text-cyan-100",
    };
  }

  if (data.status === "rain_soon") {
    return {
      title: `Rain likely in about ${data.minutesUntilRain} min`,
      detail: "Based on the latest 15-minute forecast near your location.",
      tone: "border-blue-400/40 bg-blue-950/80 text-blue-100",
    };
  }

  return {
    title: "No rain expected soon",
    detail: "Nothing showing in the next couple of hours for your area.",
    tone: "border-emerald-400/30 bg-emerald-950/70 text-emerald-100",
  };
}

export default function RainArrivalAlert() {
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const enabled = getPref("pref_notifyRain", true);

  useEffect(() => {
    if (!enabled) return;
    if (!navigator.geolocation) {
      setLocationError("Turn on location services to get rain timing alerts.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setLocationError("Allow location access to see rain timing for your area."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rainArrivalAlert", coords?.latitude, coords?.longitude],
    enabled: enabled && Boolean(coords),
    refetchInterval: 120000,
    staleTime: 90000,
    queryFn: () => fetchRainAlert(coords),
  });

  const copy = useMemo(() => getAlertCopy(data), [data]);

  useEffect(() => {
    setDismissed(false);
  }, [data?.status, data?.minutesUntilRain]);

  if (!enabled) {
    return null;
  }

  if (!locationError && data?.status === "dry") {
    return null;
  }

  if (dismissed && !locationError) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-3 right-3 top-3 z-[1100] flex justify-center">
      <div className={`pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${copy.tone}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-white/10 p-2">
            {isLoading && !data ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : locationError ? (
              <MapPin className="h-4 w-4" aria-hidden="true" />
            ) : (
              <CloudRain className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{locationError || copy.title}</p>
                  {isFetching && <span className="h-2 w-2 rounded-full bg-current opacity-70 animate-pulse" aria-hidden="true" />}
                </div>
                <p className="mt-1 text-xs opacity-80">
                  {locationError ? "The live rain timer needs your location to stay local and accurate." : copy.detail}
                </p>
              </div>
              {!locationError && (
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss rain alert"
                  aria-hidden="false"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/15"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}