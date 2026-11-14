import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import RadarApp from "./pages/RadarApp";
import { LocationProvider } from "@/lib/LocationContext";
import { AuthProvider } from "@/lib/AuthContext";
import { UnitsProvider } from "@/lib/UnitsContext";
import { NavigationStackProvider } from "@/lib/NavigationStack";
import { RadioProvider } from "@/lib/RadioContext";
import OnboardingModal from "@/components/radar/OnboardingModal";
import { isDemoHurricane } from "@/lib/demo/hurricaneFlag";

const Radar = lazy(() => import("./pages/Radar"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Globe = lazy(() => import("./pages/Globe"));
const Privacy = lazy(() => import("./pages/Privacy"));
const More = lazy(() => import("./pages/More"));
const AirQuality = lazy(() => import("./pages/AirQuality"));
const Pollen = lazy(() => import("./pages/Pollen"));
const Lightning = lazy(() => import("./pages/Lightning"));
const Hurricanes = lazy(() => import("./pages/Hurricanes"));
const Fires = lazy(() => import("./pages/Fires"));
const Briefing = lazy(() => import("./pages/Briefing"));
const Cameras = lazy(() => import("./pages/Cameras"));
const Wildfire = lazy(() => import("./pages/Wildfire"));
const Health = lazy(() => import("./pages/Health"));
const News = lazy(() => import("./pages/News"));
const Astronomy = lazy(() => import("./pages/Astronomy"));
const RadioPage = lazy(() => import("./pages/Radio"));
const Now = lazy(() => import("./pages/Now"));
const Hourly = lazy(() => import("./pages/Hourly"));
const Daily = lazy(() => import("./pages/Daily"));
const Intercept = lazy(() => import("./pages/Intercept"));
const MapLayers = lazy(() => import("./pages/MapLayers"));

const DarkFallback = () => <div className="h-full bg-slate-950" />;

function AppShell() {
  const location = useLocation();
  const demoHurricane = isDemoHurricane(location.search);
  const [showOnboarding, setShowOnboarding] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem("onboarded_v1") && !isDemoHurricane(window.location.search)
  );

  return (
    <div className="app-shell h-[100dvh] w-full overflow-hidden bg-slate-950 text-white">
      {showOnboarding && !demoHurricane && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
      <Suspense fallback={<DarkFallback />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UnitsProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LocationProvider>
          <RadioProvider>
          <Router>
            <Routes>
              <Route path="/app" element={<RadarApp />} />
              <Route
                element={
                  <NavigationStackProvider>
                    <AppShell />
                  </NavigationStackProvider>
                }
              >
                <Route path="/" element={<Now />} />
                <Route path="/Now" element={<Navigate to="/" replace />} />
                <Route path="/Hourly" element={<Hourly />} />
                <Route path="/Daily" element={<Daily />} />
                <Route path="/Radar" element={<Radar />} />
                <Route path="/Intercept" element={<Intercept />} />
                <Route path="/MapLayers" element={<MapLayers />} />
                <Route path="/Forecast" element={<Forecast />} />
                <Route path="/Globe" element={<Globe />} />
                <Route path="/More" element={<More />} />
                <Route path="/AirQuality" element={<AirQuality />} />
                <Route path="/Pollen" element={<Pollen />} />
                <Route path="/Lightning" element={<Lightning />} />
                <Route path="/Hurricanes" element={<Hurricanes />} />
                <Route path="/Fires" element={<Fires />} />
                <Route path="/Briefing" element={<Briefing />} />
                <Route path="/Cameras" element={<Cameras />} />
                <Route path="/Wildfire" element={<Wildfire />} />
                <Route path="/Health" element={<Health />} />
                <Route path="/News" element={<News />} />
                <Route path="/Astronomy" element={<Astronomy />} />
                <Route path="/Radio" element={<RadioPage />} />
                <Route path="/Contacts" element={<Contacts />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/Privacy" element={<Privacy />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Toaster />
          </Router>
          </RadioProvider>
        </LocationProvider>
      </QueryClientProvider>
      </UnitsProvider>
    </AuthProvider>
  );
}

export default App;
