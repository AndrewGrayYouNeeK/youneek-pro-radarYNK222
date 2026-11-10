import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import {
  DEFAULT_EMERGENCY_LINE,
  DEFAULT_SAFE_LINE,
  addShelterContact,
  loadSafetyMessages,
  saveSafetyMessages,
} from "@/lib/safety/sms";

const STEPS = ["location", "radar", "contacts"];

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
    if (step === "contacts") persistMessages();
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
      setLocationNote("Location is not available here. You can search for a city on the map.");
      return;
    }
    setLocationNote("Asking for location while you use the app…");
    navigator.geolocation.getCurrentPosition(
      () => setLocationNote("Location allowed. Radar and alerts can center on you."),
      () => setLocationNote("Location stayed off. Search for a city instead. You can allow it later while using the app."),
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

          {step === "location" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Location</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                YouNeeK Pro Radar asks for location only while you are using the app. It centers the radar, checks whether a warning covers you, and adds your coordinates to a safety text. If you say no, search for a city instead.
              </p>
              <button
                type="button"
                onClick={allowLocation}
                className="mt-5 w-full rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-bold text-slate-950 hover:bg-cyan-400"
              >
                Allow location
              </button>
              {locationNote && <p className="mt-3 text-xs leading-relaxed text-slate-400">{locationNote}</p>}
            </div>
          )}

          {step === "radar" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Radar</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                The map opens on the national reflectivity mosaic and shows how old the scan is. Loop, speed, and frame count sit on a small bar. Pick one NEXRAD site, such as KHTX or KLVX, from Layers when you want that radar instead of the mosaic.
              </p>
            </div>
          )}

          {step === "contacts" && (
            <div className="space-y-3 text-left">
              <div>
                <h2 className="text-xl font-bold text-white">Shelter contacts</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  Save 1 to 5 people on this device. Help Me and I’m Sheltering appear only when a severe warning covers your location. Nothing sends until you tap Send in Messages.
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
                I’m Sheltering message
                <textarea
                  value={safeText}
                  onChange={(event) => setSafeText(event.target.value)}
                  aria-label="I’m Sheltering message"
                  rows={2}
                  maxLength={320}
                  className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              {error && <p className="text-xs text-red-300">{error}</p>}
            </div>
          )}

          <div className="mt-6 space-y-2">
            {step !== "contacts" ? (
              <button
                type="button"
                onClick={() => setIndex((value) => value + 1)}
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
