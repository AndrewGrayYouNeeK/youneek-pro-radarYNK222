import { useEffect, useState } from "react";
import { formatRadarFrameAge, latestRadarFrameUnix } from "@/lib/radar/frameAge";

export default function RadarFrameStatus({ productCaption, frameClock, playbackLabel, frameTime, warningCount }) {
  const [liveTime, setLiveTime] = useState(null);

  useEffect(() => {
    if (frameTime) return undefined;
    let cancelled = false;
    const load = () => {
      latestRadarFrameUnix()
        .then((time) => {
          if (!cancelled) setLiveTime(time);
        })
        .catch(() => {
          if (!cancelled) setLiveTime(null);
        });
    };
    load();
    const timer = window.setInterval(load, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [frameTime]);

  const age = formatRadarFrameAge(frameTime || liveTime);
  const warnings = `${warningCount} ${warningCount === 1 ? "warning" : "warnings"}`;

  return (
    <p
      className="max-w-full rounded-full bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium leading-snug text-slate-200 shadow backdrop-blur"
      data-radar-age={age || ""}
    >
      {productCaption ? `${productCaption} · ` : ""}
      {frameClock} · {playbackLabel}
      {age ? ` · ${age}` : ""} · {warnings}
    </p>
  );
}
