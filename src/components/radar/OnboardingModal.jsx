import { useEffect, useState } from "react";
import { ChevronRight, ShieldAlert, ShieldCheck, Trash2, X } from "lucide-react";
import LocationOffPrompt from "@/components/location/LocationOffPrompt";
import useLocationStatus from "@/hooks/useLocationStatus";
import { finishSafetyOnboarding } from "@/lib/safety/onboarding";
import { releaseLocationGate } from "@/lib/location/locationGate";
import { MAX_SHELTER_CONTACTS, addShelterContact, loadShelterContacts, saveShelterContacts } from "@/lib/safety/sms";

const STEPS = ["contacts", "location", "radar"];

export default function OnboardingModal({ onDone }) {
  const [index, setIndex] = useState(0);
  const [contacts, setContacts] = useState(() => loadShelterContacts());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const locationStatus = useLocationStatus();
  const step = STEPS[index];

  // Location prompts wait until the safety contacts screen is done (or skipped).
  useEffect(() => {
    if (step !== "contacts") releaseLocationGate();
  }, [step]);
  useEffect(() => () => releaseLocationGate(), []);

  const finish = (skipped) => {
    finishSafetyOnboarding(window.localStorage, { skipped });
    releaseLocationGate();
    onDone();
  };

  const commitDraft = () => {
    const hasName = name.trim().length > 0;
    const hasPhone = phone.trim().length > 0;
    if (!hasName && !hasPhone) return true;
    try {
      const next = addShelterContact({ name, phone });
      setContacts(next);
      setName("");
      setPhone("");
      setError("");
      return true;
    } catch (caught) {
      setError(caught.message);
      return false;
    }
  };

  const addContact = () => {
    if (!name.trim() && !phone.trim()) {
      setError("Enter a name and phone number.");
      return;
    }
    commitDraft();
  };

  const removeContact = (id) => {
    const next = saveShelterContacts(contacts.filter((contact) => contact.id !== id));
    setContacts(next);
  };

  const continueStep = () => {
    if (step === "contacts" && !commitDraft()) return;
    if (index < STEPS.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    finish(false);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex flex-col bg-slate-950 text-white"
      data-safety-onboarding="true"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
          Step {index + 1} of {STEPS.length}
        </p>
        <button
          type="button"
          onClick={() => finish(true)}
          aria-label="Skip for now"
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-300 hover:bg-white/10"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {step === "contacts" && (
          <div className="mx-auto max-w-sm space-y-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">First things first</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Who should we text in a storm?</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                These contacts power the one-tap I’m Safe and I Need Help messages. During a warning or watch, one tap opens Messages with the alert, where you are, and a map link already written. You just tap Send. Contacts stay on this device.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden="true">
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 py-2 font-mono text-xs font-semibold text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" /> I’m Safe
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-red-400/40 bg-red-500/10 py-2 font-mono text-xs font-semibold text-red-200">
                  <ShieldAlert className="h-3.5 w-3.5" /> I Need Help
                </div>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-emerald-400/30 bg-white/5 p-4">
              <label className="block text-xs font-medium text-slate-300">
                Name
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  aria-label="Contact name"
                  placeholder="Alex"
                  autoComplete="name"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/60"
                />
              </label>
              <label className="block text-xs font-medium text-slate-300">
                Phone
                <input
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError("");
                  }}
                  aria-label="Contact phone number"
                  inputMode="tel"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(555) 555-0100"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/60"
                />
              </label>
              {error && <p className="text-xs text-red-300">{error}</p>}
              <button
                type="button"
                onClick={addContact}
                disabled={contacts.length >= MAX_SHELTER_CONTACTS}
                className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_0_18px_rgba(52,211,153,0.35)] hover:bg-emerald-300 disabled:opacity-40"
              >
                Add contact
              </button>
              <p className="text-[11px] text-slate-500">{contacts.length} of {MAX_SHELTER_CONTACTS} on this device</p>
            </div>
            {contacts.length > 0 && (
              <ul className="space-y-2">
                {contacts.map((contact) => (
                  <li key={contact.id} className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{contact.name}</div>
                      <div className="text-xs text-slate-400">{contact.phone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeContact(contact.id)}
                      aria-label={`Remove ${contact.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === "location" && (
          <div className="mx-auto max-w-sm text-center">
            <h1 className="text-2xl font-bold text-white">Location</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              YouNeeK Pro Radar asks for location only while you are using the app. It centers the radar, checks whether a warning or watch covers you, and puts a map link in I’m Safe and I Need Help. If you say no, search for a city instead.
            </p>
            {locationStatus.off ? (
              <LocationOffPrompt variant="inline" className="mt-5 text-left" />
            ) : (
              <p className="mt-5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-3 font-mono text-xs text-emerald-200">
                Location is on while you use the app.
              </p>
            )}
          </div>
        )}

        {step === "radar" && (
          <div className="mx-auto max-w-sm text-center">
            <h1 className="text-2xl font-bold text-white">Radar</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              The map opens on the national reflectivity mosaic and shows how old the scan is. Loop, speed, and frame count sit on a small bar. Pick one NEXRAD site, such as KHTX or KLVX, from Layers when you want that radar instead of the mosaic.
            </p>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-sm space-y-2 px-5 pb-4">
        <button
          type="button"
          onClick={continueStep}
          className={
            step === "contacts" && contacts.length === 0 && !name.trim() && !phone.trim()
              ? "flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 px-6 py-4 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/10"
              : "flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-bold text-slate-950 hover:bg-emerald-300"
          }
        >
          {step === "radar" ? "Done" : "Continue"}
          {step !== "radar" && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => finish(true)}
          className="w-full py-2 text-sm font-semibold text-slate-300 hover:text-white"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
