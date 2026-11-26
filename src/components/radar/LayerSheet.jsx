import { Lock } from "lucide-react";
import { GET_APP_URL, PREMIUM_LABEL, isLayerLocked, isProductLocked } from "@/lib/premium";
import { getRadarProduct } from "./radarProducts";

const VELOCITY_SCALE = [
  { label: "Inbound", color: "#16a34a" },
  { label: "Light inbound", color: "#86efac" },
  { label: "Light outbound", color: "#fecaca" },
  { label: "Outbound", color: "#ef4444" },
  { label: "Range folding", color: "#a855f7" },
];

const REFLECTIVITY_SCALE = [
  { label: "65+ dBZ", color: "#d946ef" },
  { label: "55 dBZ", color: "#ef4444" },
  { label: "45 dBZ", color: "#f97316" },
  { label: "35 dBZ", color: "#eab308" },
  { label: "20 dBZ", color: "#84cc16" },
  { label: "5 dBZ", color: "#38bdf8" },
];

const SURFACE_SCALE = {
  temperature: ["#38bdf8", "#22c55e", "#eab308", "#ef4444"],
  feelsLike: ["#38bdf8", "#22c55e", "#eab308", "#ef4444"],
  dewpoint: ["#a78bfa", "#38bdf8", "#22c55e"],
  humidity: ["#e2e8f0", "#38bdf8", "#1d4ed8"],
  uv: ["#86efac", "#eab308", "#ef4444", "#7e22ce"],
  clouds: ["#e2e8f0", "#94a3b8", "#334155"],
  pressure: ["#38bdf8", "#e2e8f0", "#f97316"],
};

function Section({ title, children }) {
  return (
    <section className="mt-3">
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

function Chip({ label, active, onClick, locked = false }) {
  if (locked) {
    return (
      <a
        href={GET_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-locked="premium"
        title={PREMIUM_LABEL}
        aria-label={`${label}: ${PREMIUM_LABEL}`}
        className="flex items-center justify-between gap-1 rounded-lg bg-white/5 px-2 py-1.5 text-left text-[12px] font-semibold text-slate-400"
      >
        {label}
        <Lock className="h-3 w-3 text-emerald-300" aria-hidden="true" />
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg px-2 py-1.5 text-left text-[12px] font-semibold ${
        active ? "bg-sky-400 text-slate-950" : "bg-white/10 text-white"
      }`}
    >
      {label}
    </button>
  );
}

function LegendRow({ label, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-5 rounded-sm" style={{ background: color }} />
      <span className="text-[11px] text-slate-200">{label}</span>
    </div>
  );
}

export default function LayerSheet({
  stations = [],
  station,
  onStationChange,
  productId,
  onProductChange,
  radarOn,
  onRadarChange,
  futureOn,
  onFutureChange,
  satelliteMode,
  onSatelliteMode,
  surfaceField,
  onSurfaceField,
  toggles,
  onToggle,
  productCaption,
  premium = true,
}) {
  const locked = (key) => isLayerLocked(key, premium);
  const product = getRadarProduct(productId);
  const velocity = productId === "velocity" || productId === "stormRelative";
  const surfaceColors = SURFACE_SCALE[surfaceField];

  return (
    <div className="absolute right-3 top-16 z-[1100] max-h-[calc(100%-8.5rem)] w-[min(20rem,calc(100%-1.5rem))] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Layers</div>
      {!premium && (
        <p className="mt-1 text-[11px] text-slate-400" data-premium-note="web">
          Free web preview. <Lock className="inline h-3 w-3 text-emerald-300" aria-hidden="true" /> layers are{" "}
          <a href={GET_APP_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline">
            in the app
          </a>
          .
        </p>
      )}

      <Section title="Radar">
        <div className="grid grid-cols-2 gap-1.5">
          <Chip label="Radar" active={radarOn} onClick={() => onRadarChange(!radarOn)} />
          <Chip label="Future" active={futureOn} locked={locked("future")} onClick={() => onFutureChange(!futureOn)} />
          {["reflectivity", "velocity", "stormRelative"].map((id) => (
            <Chip
              key={id}
              label={getRadarProduct(id).label}
              active={radarOn && productId === id}
              locked={isProductLocked(id, premium)}
              onClick={() => onProductChange(id)}
            />
          ))}
        </div>
        <label className="mt-2 block">
          <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">NEXRAD site</span>
          <select
            value={station}
            onChange={(event) => onStationChange(event.target.value)}
            aria-label="NEXRAD site"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-[12px] text-white"
          >
            {stations.map((id) => (
              <option key={id} value={id}>{id === "MOSAIC" ? "National mosaic" : id}</option>
            ))}
          </select>
        </label>
        <p className="mt-1 text-[11px] text-slate-300">{productCaption || `Showing ${station} ${product.code}`}</p>
      </Section>

      <Section title="Satellite">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            ["off", "Off"],
            ["visible", "Visible"],
            ["ir", "Infrared"],
            ["vapor", "Water vapor"],
          ].map(([id, label]) => (
            <Chip key={id} label={label} active={satelliteMode === id} onClick={() => onSatelliteMode(id)} />
          ))}
        </div>
      </Section>

      <Section title="Surface">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            ["off", "Off"],
            ["temperature", "Temperature"],
            ["feelsLike", "Feels like"],
            ["dewpoint", "Dew point"],
            ["humidity", "Humidity"],
            ["uv", "UV"],
            ["clouds", "Cloud cover"],
            ["pressure", "Pressure"],
          ].map(([id, label]) => (
            <Chip key={id} label={label} active={surfaceField === id} onClick={() => onSurfaceField(id)} />
          ))}
        </div>
        {surfaceField !== "off" && (
          <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
            Readings show as numbers after you zoom in. The national map stays clear.
          </p>
        )}
      </Section>

      <Section title="Storms and hazards">
        <div className="grid grid-cols-2 gap-1.5">
          <Chip label="Wind" active={toggles.wind} locked={locked("wind")} onClick={() => onToggle("wind")} />
          <Chip label="Precip" active={toggles.precip} locked={locked("precip")} onClick={() => onToggle("precip")} />
          <Chip label="Storm reports" active={toggles.stormReports} locked={locked("stormReports")} onClick={() => onToggle("stormReports")} />
          <Chip label="Storm cells" active={toggles.cells} locked={locked("cells")} onClick={() => onToggle("cells")} />
          <Chip label="Hurricanes" active={toggles.hurricanes} locked={locked("hurricanes")} onClick={() => onToggle("hurricanes")} />
          <Chip label="Fire detects" active={toggles.fires} locked={locked("fires")} onClick={() => onToggle("fires")} />
          <Chip label="Fire perimeters" active={toggles.perimeters} locked={locked("perimeters")} onClick={() => onToggle("perimeters")} />
          <Chip label="Snow" active={toggles.snow} locked={locked("snow")} onClick={() => onToggle("snow")} />
          <Chip label="Air quality" active={toggles.air} locked={locked("air")} onClick={() => onToggle("air")} />
          {toggles.air && (
            <p className="col-span-2 text-[11px] leading-snug text-slate-400">
              AQI numbers show after you zoom in. The national map stays clear.
            </p>
          )}
          <Chip label="Earthquakes" active={toggles.quakes} locked={locked("quakes")} onClick={() => onToggle("quakes")} />
          <Chip label="Fronts" active={toggles.fronts} locked={locked("fronts")} onClick={() => onToggle("fronts")} />
        </div>
      </Section>

      <Section title="Outlooks">
        <div className="grid grid-cols-2 gap-1.5">
          <Chip label="SPC Day 1" active={toggles.spc1} locked={locked("spc1")} onClick={() => onToggle("spc1")} />
          <Chip label="SPC Day 2" active={toggles.spc2} locked={locked("spc2")} onClick={() => onToggle("spc2")} />
          <Chip label="SPC Day 3" active={toggles.spc3} locked={locked("spc3")} onClick={() => onToggle("spc3")} />
          <Chip label="Tornado watch" active={toggles.tornadoWatch} locked={locked("tornadoWatch")} onClick={() => onToggle("tornadoWatch")} />
          <Chip label="Severe watch" active={toggles.severeWatch} locked={locked("severeWatch")} onClick={() => onToggle("severeWatch")} />
          <Chip label="Mesoscale" active={toggles.md} locked={locked("md")} onClick={() => onToggle("md")} />
        </div>
      </Section>

      <Section title="Warnings">
        <div className="grid grid-cols-2 gap-1.5">
          <Chip label="Tornado" active={toggles.tornado} locked={locked("tornado")} onClick={() => onToggle("tornado")} />
          <Chip label="Severe" active={toggles.severe} locked={locked("severe")} onClick={() => onToggle("severe")} />
          <Chip label="Flood" active={toggles.flood} locked={locked("flood")} onClick={() => onToggle("flood")} />
          <Chip label="Winter" active={toggles.winter} locked={locked("winter")} onClick={() => onToggle("winter")} />
          <Chip label="Heat" active={toggles.heat} locked={locked("heat")} onClick={() => onToggle("heat")} />
          <Chip label="Wind alert" active={toggles.windAlert} locked={locked("windAlert")} onClick={() => onToggle("windAlert")} />
          <Chip label="Fire weather" active={toggles.fireWx} locked={locked("fireWx")} onClick={() => onToggle("fireWx")} />
        </div>
      </Section>

      <div className="mt-3 rounded-xl bg-white/5 p-2" aria-label="Active legend">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {velocity ? product.label : surfaceColors ? "Surface" : satelliteMode !== "off" ? "Satellite" : "Reflectivity"}
        </div>
        <div className="flex flex-col gap-1">
          {velocity && VELOCITY_SCALE.map((row) => <LegendRow key={row.label} {...row} />)}
          {!velocity && radarOn && !surfaceColors && REFLECTIVITY_SCALE.map((row) => <LegendRow key={row.label} {...row} />)}
          {surfaceColors && (
            <div className="flex h-2.5 overflow-hidden rounded-sm">
              {surfaceColors.map((color) => (
                <span key={color} className="h-full flex-1" style={{ background: color }} />
              ))}
            </div>
          )}
          {satelliteMode === "visible" && <p className="text-[11px] text-slate-300">GOES visible, NASA GIBS</p>}
          {satelliteMode === "ir" && <p className="text-[11px] text-slate-300">Cloud-top infrared</p>}
          {satelliteMode === "vapor" && <p className="text-[11px] text-slate-300">Water vapor</p>}
        </div>
      </div>
    </div>
  );
}
