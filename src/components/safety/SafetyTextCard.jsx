import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import SafetyTextActions from "@/components/safety/SafetyTextActions";
import useUnifiedWeather from "@/hooks/useUnifiedWeather";
import { loadShelterContacts } from "@/lib/safety/sms";

export default function SafetyTextCard() {
  const { coords } = useUnifiedWeather();
  const [contacts] = useState(() => loadShelterContacts());
  const count = contacts.length;

  return (
    <section className="rounded-3xl border border-rose-400/40 bg-gradient-to-br from-rose-950/80 to-slate-950 p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20">
          <ShieldAlert className="h-5 w-5 text-rose-200" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Safety texts</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Help Me and I&apos;m Safe open a text draft to the people you saved, with a map link. You still tap Send in Messages.
            {count
              ? ` ${count} contact${count === 1 ? "" : "s"} on this device.`
              : " Add a contact before the first text."}
          </p>
        </div>
      </div>
      <SafetyTextActions coords={coords} />
      <Link to="/Contacts" className="mt-3 inline-flex text-sm font-semibold text-sky-300">
        {count ? "Manage safety contacts" : "Add safety contacts"}
      </Link>
    </section>
  );
}
