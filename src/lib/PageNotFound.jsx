import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1) || "this page";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-light text-[#00ff9c]/30">404</p>
        <div className="mx-auto mt-2 h-0.5 w-16 bg-[#00ff9c]/20" />
        <h1 className="mt-6 text-2xl font-medium text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          <span className="font-medium text-white/80">{pageName}</span> is not a route in YouNeeK Pro Radar.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/Radar"
            className="inline-flex h-12 items-center justify-center rounded-none bg-[#00ff9c] px-5 text-xs font-bold uppercase tracking-[0.25em] text-black"
          >
            Open Radar
          </Link>
          <Link to="/" className="text-sm uppercase tracking-[0.2em] text-white/50 hover:text-[#00ff9c]">
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}
