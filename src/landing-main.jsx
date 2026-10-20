import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import AppErrorBoundary from "@/components/AppErrorBoundary.jsx";
import { LocationProvider } from "@/components/landing/LocationContext";
import { queryClientInstance } from "@/lib/query-client";
import { UnitsProvider } from "@/lib/UnitsContext";
import Landing from "@/pages/Landing";
import "@/index.css";
import "@/lib/platform";

document.documentElement.classList.add("dark");
document.body.classList.add("dark");
document.title = "YouNeeK Pro Radar — MAKING IT RAIN";

function LandingSite() {
  return (
    <UnitsProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LocationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LocationProvider>
      </QueryClientProvider>
    </UnitsProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <LandingSite />
  </AppErrorBoundary>
);
