"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cliniq.sidebar-collapsed";
/** Ctrl+B (⌘B on Mac), the usual "toggle sidebar" shortcut. */
const SHORTCUT_KEY = "b";
export const SIDEBAR_SHORTCUT_LABEL = "Ctrl+B";

function saveCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Not remembered, but the toggle still works for this visit.
  }
}

/** Desktop sidebar collapsed to icons, remembered per browser and toggled with Ctrl+B. */
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === SHORTCUT_KEY;
      if (!isShortcut) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return { isCollapsed, toggle };
}
