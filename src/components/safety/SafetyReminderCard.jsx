import { Link } from "react-router-dom";
import useShelterContactCount from "@/hooks/useShelterContacts";
import { shouldRemindSafetyContacts } from "@/lib/safety/onboarding";

export default function SafetyReminderCard() {
  const count = useShelterContactCount();
  if (count > 0 || !shouldRemindSafetyContacts()) return null;

  return (
    <p className="px-1 text-xs leading-relaxed text-slate-400" data-safety-reminder="true">
      No safety contacts saved.{" "}
      <Link to="/Contacts" className="font-semibold text-emerald-300">
        Add them in Contacts
      </Link>{" "}
      so Help Me and I’m Sheltering are ready during a warning or watch.
    </p>
  );
}
