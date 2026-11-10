import { Link } from "react-router-dom";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import { PRIVACY_POLICY_PARAGRAPHS, PRIVACY_POLICY_UPDATED } from "@/content/privacyPolicy";

const PUBLIC_POLICY_URL = "https://youneek-pro-radarynk222.youneekartifacts.workers.dev/privacy";

export default function Privacy() {
  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 text-white">
      <AppHeader title="Privacy" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-28">
        <div className="mx-auto max-w-md space-y-4 text-sm leading-relaxed text-slate-300">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Updated {PRIVACY_POLICY_UPDATED}</p>
          {PRIVACY_POLICY_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
          <p>
            Apple Weather attribution: Weather data provided by Apple Weather.{" "}
            <a className="text-sky-300 underline" href="https://weatherkit.apple.com/legal-attribution.html" target="_blank" rel="noreferrer">
              WeatherKit attribution
            </a>
            .
          </p>
          <p>
            Public page:{" "}
            <a className="text-sky-300 underline" href={PUBLIC_POLICY_URL}>
              {PUBLIC_POLICY_URL}
            </a>
          </p>
          <Link to="/Settings" className="inline-block text-sky-300">
            Back to Settings
          </Link>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
