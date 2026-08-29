import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

const NavigationStackContext = createContext(null);
const TAB_STATE_STORAGE_KEY = "navigation-tab-state";

const DEFAULT_TABS = {
  Radar: { path: "/Radar", search: "", scrollY: 0 },
  Forecast: { path: "/Forecast", search: "", scrollY: 0 },
  Globe: { path: "/Globe", search: "", scrollY: 0 },
  Contacts: { path: "/Contacts", search: "", scrollY: 0 },
  Settings: { path: "/Settings", search: "", scrollY: 0 },
};

function getTabKey(pathname) {
  if (pathname.startsWith("/Forecast")) return "Forecast";
  if (pathname.startsWith("/Globe")) return "Globe";
  if (pathname.startsWith("/Contacts")) return "Contacts";
  if (pathname.startsWith("/Settings") || pathname.startsWith("/Privacy")) return "Settings";
  return "Radar";
}

export function NavigationStackProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const routeStackRef = useRef([]);
  const [tabState, setTabState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_TABS;
    const storedState = window.sessionStorage.getItem(TAB_STATE_STORAGE_KEY);
    if (!storedState) return DEFAULT_TABS;
    return {
      ...DEFAULT_TABS,
      ...JSON.parse(storedState),
    };
  });

  useEffect(() => {
    const currentRoute = `${location.pathname}${location.search}`;
    const stack = routeStackRef.current;

    if (stack.length === 0) {
      stack.push(currentRoute);
    } else if (navigationType === "POP") {
      const existingIndex = stack.lastIndexOf(currentRoute);
      if (existingIndex >= 0) {
        stack.splice(existingIndex + 1);
      } else {
        stack.push(currentRoute);
      }
    } else if (navigationType === "REPLACE") {
      stack[stack.length - 1] = currentRoute;
    } else if (stack[stack.length - 1] !== currentRoute) {
      stack.push(currentRoute);
    }

    if (window.history.state?.path !== currentRoute) {
      window.history.replaceState({ ...(window.history.state || {}), path: currentRoute }, "", currentRoute);
    }

    const tabKey = getTabKey(location.pathname);
    setTabState((current) => {
      const nextPath = location.pathname;
      const nextSearch = location.search || "";
      if (current[tabKey]?.path === nextPath && current[tabKey]?.search === nextSearch) {
        return current;
      }
      return {
        ...current,
        [tabKey]: {
          ...current[tabKey],
          path: nextPath,
          search: nextSearch,
        },
      };
    });
  }, [location.pathname, location.search, navigationType]);

  useEffect(() => {
    const handlePopState = (event) => {
      const targetPath = event.state?.path;
      if (!targetPath) return;
      const stack = routeStackRef.current;
      const existingIndex = stack.lastIndexOf(targetPath);
      if (existingIndex >= 0) {
        stack.splice(existingIndex + 1);
      } else {
        stack.push(targetPath);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(TAB_STATE_STORAGE_KEY, JSON.stringify(tabState));
  }, [tabState]);

  const value = useMemo(() => ({
    goBack: (fallbackPath = "/Radar") => {
      const stack = routeStackRef.current;
      if (stack.length > 1) {
        stack.pop();
        navigate(stack[stack.length - 1], { replace: true });
        return;
      }
      navigate(fallbackPath, { replace: true });
    },
    navigateToTab: (tabKey) => {
      const target = tabState[tabKey] || DEFAULT_TABS[tabKey];
      navigate(`${target.path}${target.search}`, { replace: false });
    },
    resetTab: (tabKey) => {
      const target = DEFAULT_TABS[tabKey];
      navigate(target.path, { replace: true });
    },
    saveScrollPosition: (tabKey, scrollY) => {
      setTabState((current) => {
        const currentTab = current[tabKey] || DEFAULT_TABS[tabKey];
        if (currentTab.scrollY === scrollY) {
          return current;
        }
        return {
          ...current,
          [tabKey]: {
            ...currentTab,
            scrollY,
          },
        };
      });
    },
    getScrollPosition: (tabKey) => tabState[tabKey]?.scrollY || 0,
  }), [navigate, tabState]);

  return (
    <NavigationStackContext.Provider value={value}>
      {children}
    </NavigationStackContext.Provider>
  );
}

export function useNavigationStack() {
  const context = useContext(NavigationStackContext);
  if (!context) {
    throw new Error("useNavigationStack must be used within NavigationStackProvider");
  }
  return context;
}
