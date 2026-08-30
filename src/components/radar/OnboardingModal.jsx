import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

const SLIDES = [
  {
    icon: "🌩️",
    title: "Live + future radar",
    body: "NEXRAD, global RainViewer, future nowcast, lightning, tropical cyclones, wildfires, and satellite. The same premium map stack — unlocked.",
  },
  {
    icon: "🌍",
    title: "3D radar globe",
    body: "Spin a live Earth with weather radar painted on the sphere, plus future radar, satellite IR, lightning, hurricanes, and fires.",
  },
  {
    icon: "☀️",
    title: "Full forecast desk",
    body: "Current conditions, next-hour precip, 168-hour hourly, 16-day outlook, AQI, pollen, UV, snow depth, and yesterday-vs-today. WeatherKit if you have it; Open-Meteo always.",
  },
  {
    icon: "🚨",
    title: "Severe weather + storm risk",
    body: "NWS watches and warnings, SPC Day 1 outlook, lightning proximity, hurricane and fire centers. No alert paywall.",
  },
  {
    icon: "🏠",
    title: "Radio + shelter texts",
    body: "NOAA Weather Radio, Emergency and I'm Safe drafts with GPS. Add contacts, then stay in control of what you send.",
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
