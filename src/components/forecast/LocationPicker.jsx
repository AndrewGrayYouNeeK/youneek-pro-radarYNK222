import { useState } from "react";
import { Crosshair, MapPin, Search, Star, X } from "lucide-react";
import { useLocation as useAppLocation } from "@/lib/LocationContext";
import { getSavedLocations, removeSavedLocation, upsertSavedLocation } from "@/lib/savedLocations";
import { openLocationSettings } from "@/lib/native/openExternal";

export default function LocationPicker({ compact = false }) {
  const { location, setLocation, detectGPS, search, locating, gpsStatus } = useAppLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState(getSavedLocations);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [settingsNote, setSettingsNote] = useState("");

  const applyLocation = (next) => {
    setLocation(next);
    setSaved(upsertSavedLocation(next));
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleSearch = async (event) => {
    event?.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError("");
    try {
      let matches = [];
      try {
        matches = await search(query.trim());
      } catch {
        matches = [];
      }
      if (!matches.length) {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`
        );
        const payload = await response.json();
        matches = (payload.results || []).map((result) => ({
          label: [result.name, result.admin1, result.country].filter(Boolean).join(", "),
          city: result.name,
          state: result.admin1 || result.country_code,
          lat: result.latitude,
          lon: result.longitude,
        }));
      }
      setResults(matches);
      if (!matches.length) setError("No matches found");
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left ${compact ? "" : "w-full"}`}
      >
        <MapPin className="h-4 w-4 text-cyan-300" />
        <span className="min-w-0 truncate text-sm text-white">
          {locating && !location ? "Locating…" : location?.label || "Choose location"}
        </span>
      </button>
      {!open && (gpsStatus === "denied" || gpsStatus === "unavailable") && (
        <div className="mt-2 rounded-2xl border border-amber-300/30 bg-amber-950/40 px-3 py-2 text-xs leading-relaxed text-amber-50">
          <p>
            {gpsStatus === "denied"
              ? "Location is off. Search a city or ZIP, or allow location while using the app."
              : "Location services aren't available. Search a city or ZIP instead."}
          </p>
          {gpsStatus === "denied" && (
            <button
              type="button"
              className="mt-2 font-semibold text-amber-200"
              onClick={async () => {
                const result = await openLocationSettings();
                setSettingsNote(result.message);
                setOpen(true);
              }}
            >
              Open Settings
            </button>
          )}
          {settingsNote && <p className="mt-1 text-amber-100/80">{settingsNote}</p>}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Saved & search
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close location picker">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              try {
                await detectGPS();
                setOpen(false);
              } catch (err) {
                const denied = err?.code === 1 || gpsStatus === "denied";
                setError(denied ? "Location is off. Search for a city or ZIP, or allow location while using the app." : (err.message || "Couldn't read location."));
              } finally {
                setBusy(false);
              }
            }}
            className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950"
          >
            <Crosshair className="h-3.5 w-3.5" />
            Use my GPS
          </button>
          <form onSubmit={handleSearch} className="mb-2 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="City, ZIP, or place"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <button type="submit" className="rounded-xl bg-white/10 px-3 text-white" aria-label="Search locations">
              <Search className="h-4 w-4" />
            </button>
          </form>
          {error && <p className="mb-2 text-xs text-amber-200">{error}</p>}
          {(gpsStatus === "denied" || gpsStatus === "unavailable") && (
            <div className="mb-2 rounded-xl border border-amber-300/30 bg-amber-950/40 px-3 py-2 text-xs leading-relaxed text-amber-50">
              <p>
                {gpsStatus === "denied"
                  ? "Location permission is off. Search a city or ZIP, or allow location while using the app."
                  : "Location services aren't available. Search a city or ZIP instead."}
              </p>
              {gpsStatus === "denied" && (
                <button
                  type="button"
                  className="mt-2 font-semibold text-amber-200"
                  onClick={async () => {
                    const result = await openLocationSettings();
                    setSettingsNote(result.message);
                  }}
                >
                  Open Settings
                </button>
              )}
              {settingsNote && <p className="mt-1 text-amber-100/80">{settingsNote}</p>}
            </div>
          )}
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {results.map((result) => (
              <button
                key={`${result.lat}-${result.lon}-${result.label}`}
                type="button"
                onClick={() =>
                  applyLocation({
                    label: result.label || `${result.city}, ${result.state}`,
                    city: result.city,
                    state: result.state,
                    lat: result.lat,
                    lon: result.lon,
                  })
                }
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-white hover:bg-white/5"
              >
                <Search className="h-3.5 w-3.5 text-slate-500" />
                {result.label || `${result.city}, ${result.state}`}
              </button>
            ))}
            {saved.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyLocation(item)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  <Star className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="truncate">{item.label}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item.label}`}
                  onClick={() => setSaved(removeSavedLocation(item.id))}
                  className="rounded-lg p-2 text-slate-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
