import { useCallback, useState } from "react";
import { DEFAULT_DOCK_IDS, MAX_DOCK_CHIPS, getMapFeature, loadDockIds, saveDockIds } from "@/lib/mapDesk";

export default function useMapDesk() {
  const [dockIds, setDockIds] = useState(() => (typeof window === "undefined" ? DEFAULT_DOCK_IDS : loadDockIds()));

  const commit = useCallback((next) => {
    setDockIds(saveDockIds(next));
  }, []);

  const pin = useCallback((id) => {
    setDockIds((current) => {
      if (current.includes(id) || current.length >= MAX_DOCK_CHIPS) return current;
      const feature = getMapFeature(id);
      const lastSame = [...current].reverse().find((item) => getMapFeature(item)?.group === feature?.group);
      if (!lastSame) return saveDockIds([...current, id]);
      const next = [...current];
      next.splice(current.lastIndexOf(lastSame) + 1, 0, id);
      return saveDockIds(next);
    });
  }, []);

  const unpin = useCallback((id) => {
    setDockIds((current) => saveDockIds(current.filter((item) => item !== id)));
  }, []);

  const togglePin = useCallback((id) => {
    setDockIds((current) => {
      if (current.includes(id)) return saveDockIds(current.filter((item) => item !== id));
      if (current.length >= MAX_DOCK_CHIPS) return current;
      const feature = getMapFeature(id);
      const lastSame = [...current].reverse().find((item) => getMapFeature(item)?.group === feature?.group);
      if (!lastSame) return saveDockIds([...current, id]);
      const next = [...current];
      next.splice(current.lastIndexOf(lastSame) + 1, 0, id);
      return saveDockIds(next);
    });
  }, []);

  const move = useCallback((id, direction) => {
    setDockIds((current) => {
      const index = current.indexOf(id);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return saveDockIds(next);
    });
  }, []);

  const reset = useCallback(() => commit(DEFAULT_DOCK_IDS), [commit]);

  return { dockIds, pin, unpin, togglePin, move, reset };
}
