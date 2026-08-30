import { useState, useCallback, Suspense, lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const RadarDisplay = lazy(() => import("../components/radar/RadarDisplay"));
import TargetDialog from "../components/radar/TargetDialog";
import BottomTab from "../components/radar/BottomTab";
import AppHeader from "@/components/mobile/AppHeader";
import RainArrivalAlert from "@/components/radar/RainArrivalAlert";
import WeatherKitStrip from "@/components/radar/WeatherKitStrip";
import { useNavigationStack } from "@/lib/NavigationStack";
import useTabPageMemory from "@/hooks/useTabPageMemory";

const DEFAULT_SETTINGS = {
  showLabels: true,
  showTails: true,
  theme: "green",    // green | amber | blue
  showNexrad: true,  // live NEXRAD overlay
  station: "KJKL",   // default station (nearest to Columbia, KY)
  product: "reflectivity",
};

export default function Radar() {
  useTabPageMemory("Radar");
  const navigate = useNavigate();
  const location = useLocation();
  const { goBack } = useNavigationStack();
  const queryClient = useQueryClient();
  const { data: targets = [] } = useQuery({
    queryKey: ["radarTargets"],
    queryFn: async () => JSON.parse(localStorage.getItem("radarTargets") || "[]"),
    initialData: [],
  });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showRadio, setShowRadio] = useState(true);
  const [showTools, setShowTools] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const dialogMode = urlParams.get("dialog");
  const selectedTargetId = urlParams.get("targetId");
  const pendingClick = dialogMode === "create"
    ? {
        bearing: Number(urlParams.get("bearing") || 0),
        range: Number(urlParams.get("range") || 0),
      }
    : null;
  const selectedTarget = targets.find((target) => target.id === selectedTargetId) || null;

  const handleTargetClick = useCallback((target) => {
    const params = new URLSearchParams();
    params.set("dialog", "inspect");
    params.set("targetId", target.id);
    navigate(`${location.pathname}?${params.toString()}`);
  }, [navigate, location.pathname]);

  const createTargetMutation = useMutation({
    mutationFn: async () => {
      const nextTargets = queryClient.getQueryData(["radarTargets"]) || [];
      localStorage.setItem("radarTargets", JSON.stringify(nextTargets));
      return nextTargets;
    },
    onMutate: async (targetData) => {
      await queryClient.cancelQueries({ queryKey: ["radarTargets"] });
      const previousTargets = queryClient.getQueryData(["radarTargets"]) || [];
      const newTarget = {
        id: Date.now().toString(),
        ...targetData,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData(["radarTargets"], [...previousTargets, newTarget]);
      if (location.search) {
        goBack(location.pathname);
      } else {
        navigate(location.pathname, { replace: true });
      }
      return { previousTargets };
    },
    onError: (_error, _targetData, context) => {
      queryClient.setQueryData(["radarTargets"], context?.previousTargets || []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["radarTargets"] });
    },
  });

  const deleteTargetMutation = useMutation({
    mutationFn: async () => {
      const nextTargets = queryClient.getQueryData(["radarTargets"]) || [];
      localStorage.setItem("radarTargets", JSON.stringify(nextTargets));
      return nextTargets;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["radarTargets"] });
      const previousTargets = queryClient.getQueryData(["radarTargets"]) || [];
      queryClient.setQueryData(["radarTargets"], previousTargets.filter((target) => target.id !== id));
      if (location.search) {
        goBack(location.pathname);
      } else {
        navigate(location.pathname, { replace: true });
      }
      return { previousTargets };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(["radarTargets"], context?.previousTargets || []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["radarTargets"] });
    },
  });

  const handleCreateTarget = useCallback((targetData) => {
    createTargetMutation.mutate(targetData);
  }, [createTargetMutation]);

  const handleDeleteTarget = useCallback((id) => {
    deleteTargetMutation.mutate(id);
  }, [deleteTargetMutation]);

  const handleCloseDialog = useCallback(() => {
    if (location.search) {
      goBack(location.pathname);
    } else {
      navigate(location.pathname, { replace: true });
    }
  }, [goBack, navigate, location.pathname, location.search]);

  const handleToolsToggle = useCallback(() => {
    setShowTools((prev) => !prev);
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-950">
      <AppHeader title="Radar" />
      <WeatherKitStrip />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <RainArrivalAlert />
        <Suspense
          fallback={(
            <div className="flex h-full items-center justify-center bg-slate-950">
              <div className="h-8 w-8 rounded-full border-4 border-slate-700 border-t-sky-400 animate-spin" />
            </div>
          )}
        >
          <RadarDisplay
            settings={settings}
            showNexrad={settings.showNexrad}
            onSettingsChange={setSettings}
            showRadio={showRadio}
            onToggleRadio={setShowRadio}
            showTools={showTools}
            onToolsToggle={handleToolsToggle}
            targets={targets}
            onTargetClick={handleTargetClick}
            onDeleteTarget={handleDeleteTarget}
          />
        </Suspense>
      </div>

      <BottomTab onToolsClick={handleToolsToggle} showTools={showTools} />

      {/* Dialogs */}
      {dialogMode === "create" && pendingClick && (
        <TargetDialog
          mode="create"
          initialData={pendingClick}
          onConfirm={handleCreateTarget}
          onClose={handleCloseDialog}
        />
      )}
      {dialogMode === "inspect" && selectedTarget && (
        <TargetDialog
          mode="inspect"
          target={selectedTarget}
          onDelete={() => handleDeleteTarget(selectedTarget.id)}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}