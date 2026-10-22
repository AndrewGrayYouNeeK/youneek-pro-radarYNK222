import { formatPrecip, formatPressure, formatTemp, formatWind } from "@/lib/weather/units";
import { useUnits } from "@/lib/UnitsContext";

function clock(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function trendLabel(value) {
  if (!value) return "";
  const words = String(value).replace(/([A-Z])/g, " $1").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function partLine(part, units) {
  if (!part) return "";
  const bits = [part.label, part.precipType].filter((bit) => bit && bit !== "—");
  if (part.high != null) bits.push(formatTemp(part.high, units.temp));
  else if (part.low != null) bits.push(formatTemp(part.low, units.temp));
  if (part.pop != null) bits.push(`${part.pop}%`);
  if (part.wind != null) bits.push(formatWind(part.wind, units.wind));
  return bits.join(" · ");
}

export default function WeatherDetails({ data }) {
  const { units } = useUnits();
  if (!data?.current) return null;

  const current = data.current.current || {};
  const daily = data.current.daily || {};
  const extra = data.details || {};
  const dew = extra.dewPoint ?? current.dew_point;
  const visibility = extra.visibilityMi ?? current.visibility_mi;
  const pressure = extra.pressure ?? current.pressure_msl;
  const trend = trendLabel(extra.pressureTrend || current.pressure_trend);
  const uv = extra.uvIndex ?? current.uv_index;
  const gust = extra.windGust ?? current.wind_gusts_10m;
  const clouds = extra.cloudCover ?? current.cloud_cover;
  const intensity = extra.precipIntensity ?? current.precipitation_intensity;
  const sunrise = clock(extra.sunrise || daily.sunrise?.[0]);
  const sunset = clock(extra.sunset || daily.sunset?.[0]);

  const groups = [
    {
      title: "Air",
      rows: [
        ["Dew point", dew != null ? formatTemp(dew, units.temp) : ""],
        ["Visibility", visibility != null ? `${Math.round(visibility)} mi` : ""],
        ["Pressure", pressure != null ? `${formatPressure(pressure, units.pressure)}${trend ? ` · ${trend}` : ""}` : ""],
        ["UV index", uv != null ? String(uv) : ""],
        ["Wind gust", gust != null ? formatWind(gust, units.wind) : ""],
        ["Humidity", current.relative_humidity_2m != null ? `${Math.round(current.relative_humidity_2m)}%` : ""],
      ],
    },
    {
      title: "Clouds",
      rows: [
        ["Sky cover", clouds != null ? `${clouds}%` : ""],
        ["Low", extra.cloudLow != null ? `${extra.cloudLow}%` : ""],
        ["Mid", extra.cloudMid != null ? `${extra.cloudMid}%` : ""],
        ["High", extra.cloudHigh != null ? `${extra.cloudHigh}%` : ""],
      ],
    },
    {
      title: "Sun and moon",
      rows: [
        ["Sunrise", sunrise],
        ["Solar noon", clock(extra.solarNoon)],
        ["Sunset", sunset],
        ["Moon", extra.moonPhase || ""],
        ["Moonrise", clock(extra.moonrise)],
        ["Moonset", clock(extra.moonset)],
      ],
    },
    {
      title: "Precipitation",
      rows: [
        ["Type", extra.precipType || ""],
        ["Intensity", intensity != null ? `${formatPrecip(intensity, units.precip)}/hr` : ""],
        ["Snowfall", extra.snowfallIn != null ? formatPrecip(extra.snowfallIn, units.precip) : ""],
        ["Daytime", partLine(extra.daytime, units)],
        ["Overnight", partLine(extra.overnight, units)],
      ],
    },
  ]
    .map((group) => ({ ...group, rows: group.rows.filter(([, value]) => value) }))
    .filter((group) => group.rows.length);

  if (!groups.length && data.source !== "weatherkit") return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3" data-weather-details="true">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Details</h2>
      <div className="mt-2 space-y-3">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.title}</div>
            <dl className="mt-1">
              {group.rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 border-t border-white/5 py-1.5 first:border-t-0">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="text-right text-sm text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      {data.source === "weatherkit" && (
        <a
          href={data.attributionUrl || "https://weatherkit.apple.com/legal-attribution.html"}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-[11px] font-medium text-slate-400 underline decoration-white/20"
        >
           Weather
        </a>
      )}
    </section>
  );
}
