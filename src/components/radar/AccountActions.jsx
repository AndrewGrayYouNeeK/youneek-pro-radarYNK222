import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { clearLocalData } from "@/lib/clearLocalData";

export default function AccountActions() {
  const [open, setOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      clearLocalData();
      window.location.href = "/";
    },
    onMutate: () => {
      setConfirmingClear(false);
      setOpen(false);
    },
  });

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setConfirmingClear(false);
      }}
    >
      <DrawerTrigger asChild>
        <button
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          aria-label="Open data menu"
        >
          Data
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-white/10 bg-slate-950 text-white">
        <DrawerHeader>
          <DrawerTitle>Local Data</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 px-4 pb-6">
          {!confirmingClear ? (
            <button
              onClick={() => setConfirmingClear(true)}
              aria-label="Clear all local data"
              className="w-full rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-950/70"
            >
              Clear All Data
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
              <p className="text-sm text-red-100">This removes all data stored on this device. Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingClear(false)}
                  aria-label="Cancel data clear"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => clearDataMutation.mutate()}
                  aria-label="Confirm data clear"
                  disabled={clearDataMutation.isPending}
                  className="flex-1 rounded-lg border border-red-500 bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Confirm Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
