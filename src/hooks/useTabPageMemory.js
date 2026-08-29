import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigationStack } from "@/lib/NavigationStack";

export default function useTabPageMemory(tabKey) {
  const location = useLocation();
  const { getScrollPosition, saveScrollPosition } = useNavigationStack();

  useEffect(() => {
    const savedScrollY = getScrollPosition(tabKey);
    const saveCurrentScroll = () => saveScrollPosition(tabKey, window.scrollY);

    requestAnimationFrame(() => window.scrollTo(0, savedScrollY));

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveCurrentScroll();
      }
    };

    window.addEventListener("pagehide", saveCurrentScroll);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      saveCurrentScroll();
      window.removeEventListener("pagehide", saveCurrentScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabKey, location.pathname, location.search]);
}