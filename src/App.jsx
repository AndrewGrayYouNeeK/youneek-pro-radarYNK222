import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageNotFound from "./lib/PageNotFound";
import Landing from "./pages/Landing";
import RadarApp from "./pages/RadarApp";
import { LocationProvider } from "@/components/landing/LocationContext";
import { AuthProvider } from "@/lib/AuthContext";
import { NavigationStackProvider } from "@/lib/NavigationStack";
import OnboardingModal from "@/components/radar/OnboardingModal";

const Radar = lazy(() => import("./pages/Radar"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Globe = lazy(() => import("./pages/Globe"));
const Privacy = lazy(() => import("./pages/Privacy"));

const Spinner = () => (
  <div className="flex h-full items-center justify-center bg-slate-950">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
  </div>
);

function AppShell() {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem("onboarded_v1")
  );

  return (
    <div className="app-shell mx-auto h-[100dvh] w-full max-w-4xl overflow-hidden bg-slate-950 text-white">
      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="h-full"
        >
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LocationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              <Route path="/app" element={<RadarApp />} />
              <Route
                element={
                  <NavigationStackProvider>
                    <AppShell />
                  </NavigationStackProvider>
                }
              >
                <Route path="/Radar" element={<Radar />} />
                <Route path="/Forecast" element={<Forecast />} />
                <Route path="/Globe" element={<Globe />} />
                <Route path="/Contacts" element={<Contacts />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/Privacy" element={<Privacy />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </LocationProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
