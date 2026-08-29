import { CloudOff, MapPin, RefreshCw } from "lucide-react";

export default function WeatherKitSetupNotice({ type = "not-configured", message, onRetry }) {
  const copy =
    type === "location"
      ? {
          title: "Location needed",
          detail: message || "Allow location access to load Apple WeatherKit forecasts.",
          icon: MapPin,
        }
      : type === "error"
        ? {
            title: "Forecast unavailable",
            detail: message || "WeatherKit could not load right now.",
            icon: CloudOff,
          }
        : {
            title: "WeatherKit not configured",
            detail:
              message ||
              "Add your Apple Developer credentials to .env locally or Cloudflare Worker secrets. See WEATHERKIT.md.",
            icon: CloudOff,
          };

  const Icon = copy.icon;

  return (
    <div className="rounded-3xl border border-amber-400/20 bg-amber-950/30 p-5 text-amber-50">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white/10 p-2">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{copy.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-100/80">{copy.detail}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
