import { Suspense, lazy, useState } from "react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import { loadRadarLayers } from "@/lib/radarLayers";

const RadarDisplay = lazy(() => import("@/components/radar/RadarDisplay"));

const MAP_DEFAULTS = {
  showLabels: true,
  showTails: true,
  theme: "green",
  showNexrad: true,
  station: "KJKL",
  product: "reflectivity",
};

function MapFallback() {
  return <div className="h-full w-full bg-slate-900" />;
}

export default function ForecastLayout({ title, children }) {
  const [settings, setSettings] = useState(() => ({
    ...MAP_DEFAULTS,
    showNexrad: loadRadarLayers().radar,
  }));

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title={title} />
      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 w-full overflow-y-auto px-4 pb-28 pt-4 lg:w-[26rem] lg:shrink-0 xl:w-[32rem]">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-4 lg:max-w-none">{children}</div>
        </div>
        <div
          className="relative hidden min-h-0 flex-1 border-l border-white/10 lg:block"
          style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
        >
          <Suspense fallback={<MapFallback />}>
            <RadarDisplay
              settings={settings}
              showNexrad={settings.showNexrad}
              onSettingsChange={setSettings}
              showRadio={false}
              onToggleRadio={() => {}}
              variant="clean"
            />
          </Suspense>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
