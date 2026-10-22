import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import {
  DEFAULT_EMERGENCY_LINE,
  DEFAULT_SAFE_LINE,
  addShelterContact,
  loadSafetyMessages,
  saveSafetyMessages,
} from "@/lib/safety/sms";

const STEPS = ["welcome", "safety"];

export default function OnboardingModal({ onDone }) {
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [helpText, setHelpText] = useState(() => loadSafetyMessages().emergency);
  const [safeText, setSafeText] = useState(() => loadSafetyMessages().safe);
  const [error, setError] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const step = STEPS[index];

  const finish = () => {
    localStorage.setItem("onboarded_v1", "true");
    onDone();
  };

  const persistMessages = () => {
    saveSafetyMessages({
      emergency: helpText.trim() || DEFAULT_EMERGENCY_LINE,
      safe: safeText.trim() || DEFAULT_SAFE_LINE,
    });
  };

  const close = () => {
    if (step === "safety") persistMessages();
    finish();
  };

  const saveAndFinish = () => {
    persistMessages();
    const hasName = name.trim().length > 0;
    const hasPhone = phone.trim().length > 0;
    if (hasName || hasPhone) {
      try {
        addShelterContact({ name, phone });
      } catch (caught) {
        setError(caught.message);
        return;
      }
    }
    finish();
  };

  const allowLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("Location is not available in this browser.");
      return;
    }
    setLocationNote("Asking for location…");
    navigator.geolocation.getCurrentPosition(
      () => setLocationNote("Location allowed. The map link can use your position."),
      () => setLocationNote("Location stayed off. You can allow it later in the browser."),
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-slate-950/80 px-3 py-3 sm:items-center">
      <div className="relative flex max-h-[92dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
        <button
          type="button"
          onClick={close}
          aria-label="Close intro"
          className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-12">
          <div className="mb-5 flex items-center justify-center gap-2" aria-label={`Step ${index + 1} of ${STEPS.length}`}>
            {STEPS.map((id, dot) => (
              <div
                key={id}
                className="h-1.5 rounded-full"
                style={{
                  width: dot === index ? 24 : 6,
                  background: dot === index ? "#22d3ee" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>

          {step === "welcome" && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-slate-900 text-4xl">
                🌩️
              </div>
              <h2 className="text-2xl font-bold text-white">YouNeeK Pro Radar</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Live radar, the forecast, and NOAA alerts. Next, add the people who should get a safety text if a warning covers you.
              </p>
            </div>
          )}

          {step === "safety" && (
            <div className="space-y-3 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Safety texts</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  Add one emergency contact and check the messages. Nothing sends until you tap Send in Messages.
                </p>
              </div>
              <label className="block text-xs font-medium text-slate-300">
                Contact name
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  aria-label="Contact name"
                  placeholder="Alex"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </label>
              <label className="block text-xs font-medium text-slate-300">
                Phone number
                <input
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError("");
                  }}
                  aria-label="Contact phone number"
                  inputMode="tel"
                  type="tel"
                  placeholder="(555) 555-0100"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </label>
              <label className="block text-xs font-medium text-slate-300">
                Help Me message
                <textarea
                  value={helpText}
                  onChange={(event) => setHelpText(event.target.value)}
                  aria-label="Help Me message"
                  rows={2}
                  maxLength={320}
                  className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <label className="block text-xs font-medium text-slate-300">
                I&apos;m Safe message
                <textarea
                  value={safeText}
                  onChange={(event) => setSafeText(event.target.value)}
                  aria-label="I'm Safe message"
                  rows={2}
                  maxLength={320}
                  className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <button
                type="button"
                onClick={allowLocation}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white"
              >
                Allow location for the map link
              </button>
              {locationNote && <p className="text-xs text-slate-400">{locationNote}</p>}
              {error && <p className="text-xs text-red-300">{error}</p>}
            </div>
          )}

          <div className="mt-6 space-y-2">
            {step === "welcome" ? (
              <button
                type="button"
                onClick={() => setIndex(1)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-bold text-slate-950 hover:bg-cyan-400"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={saveAndFinish}
                className="w-full rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-bold text-slate-950 hover:bg-cyan-400"
              >
                Save and continue
              </button>
            )}
            <button type="button" onClick={close} className="w-full py-2 text-sm text-slate-400 hover:text-white">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
