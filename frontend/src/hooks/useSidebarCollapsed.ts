"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cliniq.sidebar-collapsed";

function saveCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Not remembered, but the toggle still works for this visit.
  }
}

/** Desktop sidebar collapsed to icons, remembered per browser. */
export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      setIsCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // Storage blocked (private mode, etc.): start expanded.
    }
  }, []);

  const toggle = useCallback(() => {
    setIsCollapsed((current) => {
      saveCollapsed(!current);
      return !current;
    });
  }, []);

  return { isCollapsed, toggle };
}
