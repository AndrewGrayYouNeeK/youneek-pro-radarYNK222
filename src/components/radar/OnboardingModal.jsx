import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

const SLIDES = [
  {
    icon: "🌩️",
    title: "Live NEXRAD Radar",
    body: "See live NEXRAD, global radar, velocity, future nowcast, lightning reports, tropical cyclones, and satellite. Everything ships with the app — no extra paywall.",
  },
  {
    icon: "🌍",
    title: "3D Radar Globe",
    body: "Spin a live weather globe with radar, infrared satellite, lightning, hurricanes, and wildfires. The same premium globe view — unlocked for everyone.",
  },
  {
    icon: "☀️",
    title: "Full forecast desk",
    body: "Current conditions, next-hour precipitation, hourly and 14-day outlooks, AQI, pollen, UV, sports scores, and alerts. Works with or without WeatherKit.",
  },
  {
    icon: "🚨",
    title: "Severe Weather Alerts",
    body: "Tornado, thunderstorm, flood, and winter alerts are pulled live from the National Weather Service and drawn directly on your map.",
  },
  {
    icon: "📻",
    title: "NOAA Weather Radio",
    body: "Open Tools, then Layers, to stream your nearest NOAA Weather Radio station. Auto-tune can be turned off in Settings.",
  },
  {
    icon: "🏠",
    title: "Shelter Notifications",
    body: "Add contacts, then send an Emergency text or an I'm Safe text with your GPS location. Drafts open in Messages so you stay in control.",
  },
];

export default function OnboardingModal({ onDone }) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/95 backdrop-blur-md px-6">
      <div className="w-full max-w-sm">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 24 : 6,
                background: i === index ? "#22d3ee" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="text-center"
          >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 border border-white/10 text-5xl shadow-xl">
                {slide.icon}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">{slide.title}</h2>
            <p className="text-sm leading-relaxed text-slate-300">{slide.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="mt-10 space-y-3">
          <button
            type="button"
            onClick={() => {
              if (isLast) {
                localStorage.setItem("onboarded_v1", "true");
                onDone();
              } else {
                setIndex((i) => i + 1);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.3)] transition-colors hover:bg-cyan-400"
          >
            {isLast ? "Get started" : "Next"}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {!isLast && (
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("onboarded_v1", "true");
                onDone();
              }}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
