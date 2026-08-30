import { useEffect, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { loadSavedLocations, saveSavedLocations, searchPlaces } from "@/lib/locationStore";

export default function LocationSearch({ current, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState(() => loadSavedLocations());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      searchPlaces(query).then(setResults).catch(() => setResults([]));
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  const choose = (place) => {
    onSelect(place);
    const nextSaved = [place, ...saved.filter((item) => item.label !== place.label)].slice(0, 8);
    setSaved(nextSaved);
    saveSavedLocations(nextSaved);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left"
        aria-label="Search or change location"
      >
        <MapPin className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-white">{current?.label || "Choose a location"}</div>
          {current && (
            <div className="text-[10px] text-slate-500">
              {current.latitude?.toFixed?.(2)}°, {current.longitude?.toFixed?.(2)}°
            </div>
          )}
        </div>
        <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="City, airport, or place"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              aria-label="Search places"
              autoFocus
            />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close location search">
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {results.map((place) => (
              <button
                key={`${place.label}-${place.latitude}`}
                type="button"
                onClick={() => choose({ ...place, source: "search" })}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                <MapPin className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                {place.label}
              </button>
            ))}
            {!results.length && saved.length > 0 && (
              <div className="px-2 py-1">
                <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">Saved</div>
                {saved.map((place) => (
                  <button
                    key={`${place.label}-${place.latitude}`}
                    type="button"
                    onClick={() => choose({ ...place, source: "saved" })}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                  >
                    {place.label}
                  </button>
                ))}
              </div>
            )}
            {!results.length && query.length >= 2 && (
              <p className="px-3 py-2 text-xs text-slate-500">No matching places.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
