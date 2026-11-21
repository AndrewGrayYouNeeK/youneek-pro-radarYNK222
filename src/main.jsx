import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import AppErrorBoundary from "@/components/AppErrorBoundary.jsx";
import { bootNativeShell } from "@/lib/native/boot";
import { installLocationGate } from "@/lib/location/locationGate";
import { shouldShowSafetyOnboarding } from "@/lib/safety/onboarding";
import "@/index.css";
import "@/lib/platform";

document.documentElement.classList.add("dark");
document.body.classList.add("dark");
document.title = "YouNeeK Pro Radar";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

const root = document.getElementById("root");

bootNativeShell().finally(() => {
  // First launch: safety contacts come first; the location prompt waits until after that screen.
  try {
    const firstLaunch = shouldShowSafetyOnboarding(window.localStorage) && window.location.pathname !== "/app";
    installLocationGate(navigator.geolocation, { hold: firstLaunch });
  } catch {
    /* never block startup */
  }
  ReactDOM.createRoot(root).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
});
