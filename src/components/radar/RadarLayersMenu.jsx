import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AccountActions from "./AccountActions";
import RadioControls from "./RadioControls";

function ToggleRow({ label, checked, onCheckedChange, ariaLabel }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[13px] leading-tight text-white">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={ariaLabel || label} />
    </div>
  );
}

export default function RadarLayersMenu({
  isOpen,
  onToggle,
  showNexrad,
  showRadio,
  showLightning,
  showHurricanes,
  showSatellite,
  showGlobalRadar,
  showFutureRadar,
  showFires,
  alertToggles,
  onShowNexradChange,
  onShowRadioChange,
  onShowLightningChange,
  onShowHurricanesChange,
  onShowSatelliteChange,
  onShowGlobalRadarChange,
  onShowFutureRadarChange,
  onShowFiresChange,
  onAlertToggleChange,
}) {
  const [showAlerts, setShowAlerts] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle();
      }
    };

    // Add slight delay to prevent immediate closing when opening
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div
      ref={menuRef}
      className="absolute z-[1000]"
      style={{ top: "0.75rem", right: "0.75rem" }}
    >
      {isOpen && (
        <div className="w-[min(18rem,calc(100vw-1.5rem))] max-h-[calc(100vh-7.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Layers
          </div>
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Radar</div>
              <ToggleRow
                label="📡 Live NEXRAD"
                checked={showNexrad}
                onCheckedChange={onShowNexradChange}
                ariaLabel="Toggle live NEXRAD radar layer"
              />
              <ToggleRow
                label="🌍 Global radar"
                checked={showGlobalRadar}
                onCheckedChange={onShowGlobalRadarChange}
                ariaLabel="Toggle global RainViewer radar"
              />
              <ToggleRow
                label="⏭️ Future radar"
                checked={showFutureRadar}
                onCheckedChange={onShowFutureRadarChange}
                ariaLabel="Toggle future radar nowcast"
              />
              <ToggleRow
                label="🛰️ Satellite"
                checked={showSatellite}
                onCheckedChange={onShowSatelliteChange}
                ariaLabel="Toggle satellite layer"
              />
              <ToggleRow
                label="⚡ Lightning reports"
                checked={showLightning}
                onCheckedChange={onShowLightningChange}
                ariaLabel="Toggle lightning reports"
              />
              <ToggleRow
                label="🌀 Tropical cyclones"
                checked={showHurricanes}
                onCheckedChange={onShowHurricanesChange}
                ariaLabel="Toggle tropical cyclone markers"
              />
              <ToggleRow
                label="🔥 Wildfires"
                checked={showFires}
                onCheckedChange={onShowFiresChange}
                ariaLabel="Toggle wildfire detections"
              />
              <div className="text-[11px] text-slate-500">Loop control sits on the map. Future radar is included — no paywall.</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <button
                type="button"
                onClick={() => setShowAlerts((value) => !value)}
                className="flex w-full items-center justify-between text-left"
                aria-label={showAlerts ? "Hide warning controls" : "Show warning controls"}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Warnings</div>
                {showAlerts ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {showAlerts && (
                <div className="mt-2 space-y-2">
                  <ToggleRow
                    label="🌪️ Tornado Warnings"
                    checked={alertToggles.tornado}
                    onCheckedChange={(value) => onAlertToggleChange("tornado", value)}
                    ariaLabel="Toggle tornado warnings layer"
                  />
                  <ToggleRow
                    label="⛈️ Severe Thunderstorm"
                    checked={alertToggles.severe}
                    onCheckedChange={(value) => onAlertToggleChange("severe", value)}
                    ariaLabel="Toggle severe thunderstorm warnings layer"
                  />
                  <ToggleRow
                    label="🌊 Flood Warnings"
                    checked={alertToggles.flood}
                    onCheckedChange={(value) => onAlertToggleChange("flood", value)}
                    ariaLabel="Toggle flood warnings layer"
                  />
                  <ToggleRow
                    label="❄️ Winter Advisories"
                    checked={alertToggles.winter}
                    onCheckedChange={(value) => onAlertToggleChange("winter", value)}
                    ariaLabel="Toggle winter advisories layer"
                  />
                  <ToggleRow
                    label="🥵 Heat"
                    checked={alertToggles.heat}
                    onCheckedChange={(value) => onAlertToggleChange("heat", value)}
                    ariaLabel="Toggle heat alerts layer"
                  />
                  <ToggleRow
                    label="💨 High wind"
                    checked={alertToggles.wind}
                    onCheckedChange={(value) => onAlertToggleChange("wind", value)}
                    ariaLabel="Toggle wind alerts layer"
                  />
                  <ToggleRow
                    label="🚩 Red flag"
                    checked={alertToggles.fire}
                    onCheckedChange={(value) => onAlertToggleChange("fire", value)}
                    ariaLabel="Toggle fire weather alerts layer"
                  />
                </div>
              )}
            </div>

            <RadioControls showRadio={showRadio} onShowRadioChange={onShowRadioChange} />

            <AccountActions />
          </div>
        </div>
      )}
    </div>
  );
}
