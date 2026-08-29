// Tiny platform detector — runs once on import and sets a body class
// so platform-specific font stacks (and any future tweaks) can be applied
// purely from CSS without re-renders.

function detect() {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  // iOS — covers iPhone, iPad (including iPadOS reporting as Mac with touch)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1);
  if (isIOS) return "ios";

  if (/Android/.test(ua)) return "android";
  return "web";
}

export const PLATFORM = detect();

// Apply once on import.
if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
  document.body.classList.add("dark", `platform-${PLATFORM}`);
}