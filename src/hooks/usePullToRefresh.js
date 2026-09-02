import { useRef, useState } from "react";

export default function usePullToRefresh({ onRefresh, threshold = 90 }) {
  const pullStartYRef = useRef(null);
  const pullEnabledRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 900);
  };

  const handleTouchStart = (event) => {
    if (window.scrollY > 0) return;
    pullStartYRef.current = event.touches[0]?.clientY || null;
    pullEnabledRef.current = true;
  };

  const handleTouchMove = (event) => {
    if (!pullEnabledRef.current || pullStartYRef.current === null) return;
    const currentY = event.touches[0]?.clientY || 0;
    if (currentY - pullStartYRef.current > threshold) {
      triggerRefresh();
      pullEnabledRef.current = false;
      pullStartYRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    pullEnabledRef.current = false;
    pullStartYRef.current = null;
  };

  return {
    isRefreshing,
    triggerRefresh,
    pullToRefreshHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}