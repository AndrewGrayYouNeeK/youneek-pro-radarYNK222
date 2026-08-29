import { useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function RadioStationPicker({ stations, selectedStationId, onStationChange }) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => stations.find((station) => station.id === selectedStationId)?.label || "Select station",
    [selectedStationId, stations]
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-left text-sm text-white outline-none"
          aria-label="Choose radio station"
        >
          {selectedLabel}
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-white/10 bg-slate-950 text-white">
        <DrawerHeader>
          <DrawerTitle>Radio Station</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto px-4 pb-6">
          {stations.map((station) => (
            <button
              key={station.id}
              aria-label={`Choose ${station.label}`}
              onClick={() => {
                onStationChange(station.id);
                setOpen(false);
              }}
              className={`w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                selectedStationId === station.id
                  ? "border-green-500 bg-green-950 text-green-300"
                  : "border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {station.label}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}