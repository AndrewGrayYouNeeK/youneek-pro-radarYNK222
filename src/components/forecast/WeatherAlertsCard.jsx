export default function WeatherAlertsCard({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Apple Weather Alerts
        </h2>
        <p className="mt-2 text-sm text-slate-300">No official WeatherKit alerts for this location.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Apple Weather Alerts
      </h2>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className="rounded-2xl border border-amber-400/25 bg-amber-950/30 px-4 py-3"
          >
            <div className="text-sm font-semibold text-amber-50">{alert.name}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-amber-200/70">
              {[alert.severity, alert.urgency, alert.source].filter(Boolean).join(" · ")}
            </div>
            {alert.description && (
              <p className="mt-2 text-xs leading-relaxed text-amber-100/80">{alert.description}</p>
            )}
            {alert.expires && (
              <p className="mt-2 text-[11px] text-slate-400">
                Until {new Date(alert.expires).toLocaleString()}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
