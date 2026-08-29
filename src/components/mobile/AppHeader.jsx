import { ChevronLeft, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNavigationStack } from "@/lib/NavigationStack";

const TITLES = {
  "/Radar": "Radar",
  "/Forecast": "Forecast",
  "/Globe": "Globe",
  "/Contacts": "Contacts",
  "/Settings": "Settings",
  "/Privacy": "Privacy",
};

export default function AppHeader({ title }) {
  const location = useLocation();
  const { goBack } = useNavigationStack();
  const resolvedTitle = title || TITLES[location.pathname] || "YouNeeK Pro Radar";
  const showBack = location.pathname !== "/Radar";

  return (
    <header className="sticky top-0 z-[1700] shrink-0 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div
        className="mx-auto flex h-14 max-w-lg items-center justify-between px-4"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={() => goBack()}
              aria-label="Go back"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <Link
              to="/"
              aria-label="Back to landing"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
          <h1 className="truncate text-lg font-semibold text-white">{resolvedTitle}</h1>
        </div>
        <div className="h-11 w-11" />
      </div>
    </header>
  );
}
