import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SafetyTextActions from "@/components/safety/SafetyTextActions";
import { loadShelterContacts } from "@/lib/safety/sms";
import { getPref } from "@/lib/prefs";

export default function ShelterAlert({ activeTornadoWarning, activeTornadoWatch }) {
  const [dismissed, setDismissed] = useState(false);
  const contacts = loadShelterContacts();
  const notifyEnabled = getPref("pref_notifyTornado", true);
  const isActive = activeTornadoWarning || activeTornadoWatch;
  if (!notifyEnabled || !contacts.length || !isActive || dismissed) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="alert"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            {activeTornadoWarning ? "Tornado Warning Active" : "Tornado Watch Active"}
          </div>
          <button type="button" onClick={() => setDismissed(true)} className="text-[11px] text-slate-400">
            Hide
          </button>
        </div>
        <p className="mb-3 text-xs leading-5 text-slate-300">
          Send an emergency text or an I&apos;m Safe text to {contacts.map((contact) => contact.name).join(", ")}.
          Drafts open in Messages — you still tap Send.
        </p>
        <SafetyTextActions compact />
      </motion.div>
    </AnimatePresence>
  );
}
