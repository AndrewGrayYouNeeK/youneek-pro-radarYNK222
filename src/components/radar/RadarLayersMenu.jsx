import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Pin, PinOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AccountActions from "./AccountActions";
import RadioControls from "./RadioControls";
import { RADAR_PRODUCTS } from "./radarProducts";
import { MAP_FEATURE_GROUPS, MAP_FEATURES, MAX_DOCK_CHIPS } from "@/lib/mapDesk";

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
  productId,
  onProductChange,
  dockIds = [],
  onTogglePin,
  onMovePin,
  onResetDock,
  onFeatureAction,
  showSafetyActions = false,
}) {
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const menuRef = useRef(null);

  const openRoute = (path) => {
    onToggle();
    navigate(path);
  };

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
                label="📡 Live radar"
                checked={showNexrad}
                onCheckedChange={onShowNexradChange}
                ariaLabel="Toggle live radar layer"
              />
              <label className="block">
                <span className="text-[11px] text-slate-400">Product</span>
                <select
                  value={productId || "reflectivity"}
                  onChange={(event) => onProductChange?.(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-[13px] text-white"
                  aria-label="Radar product"
                >
                  {RADAR_PRODUCTS.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.label}
                    </option>
                  ))}
                </select>
              </label>
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

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <button
                type="button"
                onClick={() => setShowCustomize((value) => !value)}
                className="flex w-full items-center justify-between text-left"
                aria-label={showCustomize ? "Hide map shortcuts" : "Customize map shortcuts"}
              >
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">On this radar</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {dockIds.length}/{MAX_DOCK_CHIPS} tools showing
                  </div>
                </div>
                {showCustomize ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>
              {showCustomize && (
                <div className="space-y-3">
                  {MAP_FEATURE_GROUPS.map((group) => (
                    <div key={group.id}>
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</div>
                      <div className="space-y-1">
                        {MAP_FEATURES.filter((feature) => feature.group === group.id).map((feature) => {
                          const pinned = dockIds.includes(feature.id);
                          const index = dockIds.indexOf(feature.id);
                          return (
                            <div key={feature.id} className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-1.5">
                              <button
                                type="button"
                                className="min-w-0 flex-1 text-left text-sm text-white"
                                onClick={() => {
                                  if (feature.kind === "route" && feature.path) openRoute(feature.path);
                                  else onFeatureAction?.(feature.id);
                                }}
                              >
                                {feature.label}
                              </button>
                              {pinned && onMovePin && (
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    aria-label={`Move ${feature.label} up`}
                                    onClick={() => onMovePin(feature.id, -1)}
                                    disabled={index <= 0}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 disabled:opacity-30"
                                  >
                                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Move ${feature.label} down`}
                                    onClick={() => onMovePin(feature.id, 1)}
                                    disabled={index < 0 || index >= dockIds.length - 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 disabled:opacity-30"
                                  >
                                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => onTogglePin?.(feature.id)}
                                aria-label={pinned ? `Hide ${feature.label} from radar` : `Show ${feature.label} on radar`}
                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[11px] font-semibold ${
                                  pinned ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-300"
                                }`}
                              >
                                {pinned ? <Pin className="h-3.5 w-3.5" aria-hidden="true" /> : <PinOff className="h-3.5 w-3.5" aria-hidden="true" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {showSafetyActions && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onFeatureAction?.("help")}
                        className="flex min-h-11 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white"
                      >
                        Help Me
                      </button>
                      <button
                        type="button"
                        onClick={() => onFeatureAction?.("safe")}
                        className="flex min-h-11 items-center justify-center rounded-xl bg-emerald-400 text-sm font-bold text-slate-950"
                      >
                        I&apos;m Safe
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onResetDock}
                    className="flex min-h-10 w-full items-center justify-center rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
                  >
                    Reset to all tools
                  </button>
                </div>
              )}
            </div>

            <AccountActions />
          </div>
        </div>
      )}
    </div>
  );
}
