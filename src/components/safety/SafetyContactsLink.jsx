import { Link } from "react-router-dom";
import useSafetyTexts from "@/hooks/useSafetyTexts";

export default function SafetyContactsLink() {
  const { show } = useSafetyTexts();
  if (show) return null;

  return (
    <Link to="/Contacts" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-sm font-semibold text-white">Safety contacts</div>
      <div className="mt-0.5 text-xs leading-relaxed text-slate-400">
        Add people ahead of time. Help Me and I&apos;m Safe appear only during an active warning.
      </div>
    </Link>
  );
}
