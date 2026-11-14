/** Opt-in screenshot mode. Absent or any other value leaves the app unchanged. */
export function readDemoParams(search) {
  const raw = String(search || "");
  const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : raw;
  return new URLSearchParams(query);
}

export function isDemoHurricane(search) {
  return readDemoParams(search).get("demo")?.toLowerCase() === "hurricane";
}

/** @returns {"overview"|"eye"|"alert"|"velocity"|null} */
export function demoHurricaneView(search) {
  if (!isDemoHurricane(search)) return null;
  const view = readDemoParams(search).get("demoView")?.toLowerCase();
  if (view === "eye" || view === "alert" || view === "velocity") return view;
  return "overview";
}
