import { Link } from "react-router-dom";
import useShelterContactCount from "@/hooks/useShelterContacts";

export default function SafetyReminderCard() {
  const count = useShelterContactCount();
  if (count > 0) return null;

  return (
    <section className="rounded-3xl border border-amber-300/30 bg-amber-950/30 p-4" data-safety-reminder="true">
      <h2 className="text-sm font-semibold text-amber-100">Add a safety contact</h2>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/80">
        Help Me and I&apos;m Safe stay hidden until a warning covers your location. Add someone now so the texts are ready.
      </p>
      <Link to="/Contacts" className="mt-3 inline-flex text-sm font-semibold text-amber-200">
        Set up safety texts
      </Link>
    </section>
  );
}
