import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import SafetyTextActions from "@/components/safety/SafetyTextActions";
import useSafetyTexts from "@/hooks/useSafetyTexts";
import useShelterContactCount from "@/hooks/useShelterContacts";

export default function SafetyTextCard() {
  const { alerts, coords, show, primary } = useSafetyTexts();
  const count = useShelterContactCount();
  if (!show || !primary) return null;

  const extra = alerts.length > 1 ? ` and ${alerts.length - 1} more` : "";

  return (
    <section className="rounded-3xl border border-rose-400/40 bg-gradient-to-br from-rose-950/80 to-slate-950 p-4" data-safety-card="active">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20">
          <ShieldAlert className="h-5 w-5 text-rose-200" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Safety texts</h2>
          <p className="mt-1 text-sm font-semibold text-rose-100" data-safety-alert={primary.name}>
            {primary.name}
            {extra}
          </p>
          {primary.source === "preview" && (
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-200/70">Simulated alert</p>
          )}
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            This warning covers your location. Help Me and I&apos;m Safe open a text draft. You still tap Send in Messages.
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
