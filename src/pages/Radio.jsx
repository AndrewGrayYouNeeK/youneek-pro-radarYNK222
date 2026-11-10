import { useEffect, useState } from "react";
import PageScaffold from "@/components/more/PageScaffold";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { useLocation as useAppLocation } from "@/lib/LocationContext";
import { loadNwrTransmitters } from "@/lib/nwr/loadStations";
import { NWR_LISTING_PAGE, nearestTransmitters, tuneInstruction } from "@/lib/nwr/stations";
import { getPref } from "@/lib/prefs";

export default function RadioPage() {
  useTabPageMemory("More");
  const { location } = useAppLocation();
  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("Finding NOAA Weather Radio transmitters…");
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadNwrTransmitters()
      .then((result) => {
        if (cancelled) return;
        setStations(result.stations);
        setFromCache(result.fromCache);
        setStatus(result.fromCache ? "Using the transmitter list saved on this device." : "Transmitters from the National Weather Service.");
      })
      .catch(() => {
        if (!cancelled) setStatus("The National Weather Service transmitter list did not load. A weather radio still uses 162.400 to 162.550 MHz.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lat = Number(location?.lat);
  const lon = Number(location?.lon);
  const nearby = nearestTransmitters(stations, lat, lon, 8);
  const autoTune = getPref("pref_autoTune", true);
  const selected = nearby.find((station) => station.id === selectedId) || (autoTune ? nearby[0] : null);

  return (
    <PageScaffold title="Radio">
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">NOAA Weather Radio</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">{selected ? selected.name : "Nearby transmitters"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            The closest official transmitters are selected from your location. NOAA does not offer an internet stream of Weather Radio that this app can play, so use the frequency on a weather radio.
          </p>
        </div>
        <p className="text-xs text-slate-400">{status}</p>
        {selected && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-4">
            <div className="text-sm font-semibold text-white">
              {selected.callsign} · {selected.name}{selected.state ? `, ${selected.state}` : ""}
            </div>
            <p className="mt-2 text-base font-semibold text-emerald-100">{tuneInstruction(selected)}</p>
            {selected.status && selected.status !== "NORMAL" && (
              <p className="mt-2 text-xs text-amber-200">NWS lists this transmitter as {selected.status}.</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          {nearby.map((station) => (
            <button
              key={station.id}
              type="button"
              onClick={() => setSelectedId(station.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left ${
                selected?.id === station.id ? "border-emerald-400/40 bg-white/10" : "border-white/10 bg-white/5"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-white">{station.callsign}</span>
                <span className="block text-xs text-slate-400">
                  {station.name}{station.state ? `, ${station.state}` : ""}
                </span>
              </span>
              <span className="text-sm font-semibold text-emerald-200">{station.frequencyMHz} MHz</span>
            </button>
          ))}
          {!nearby.length && stations.length > 0 && (
            <p className="text-sm text-slate-300">Allow location or search for a city, then reopen this page to list transmitters near you.</p>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Transmitter names, call signs, and frequencies come from the National Weather Service NOAA Weather Radio listing ({NWR_LISTING_PAGE}), which is U.S. government work. {fromCache ? "This copy was saved on the device." : ""} This app does not rebroadcast the audio.
        </p>
      </div>
    </PageScaffold>
  );
}
