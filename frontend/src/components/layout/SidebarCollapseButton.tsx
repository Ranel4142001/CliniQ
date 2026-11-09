import React from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIDEBAR_SHORTCUT_LABEL } from "@/hooks/useSidebarCollapsed";

interface SidebarCollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/** In-sidebar control to fold the sidebar to icons (more room for the page) or open it again. */
export function SidebarCollapseButton({ isCollapsed, onToggle }: SidebarCollapseButtonProps) {
  const label = isCollapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <button
      type="button"
      onClick={onToggle}
      title={`${label} (${SIDEBAR_SHORTCUT_LABEL})`}
      aria-label={label}
      aria-expanded={!isCollapsed}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isCollapsed ? "justify-center px-0" : "px-3.5"
      )}
    >
      {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      {!isCollapsed && (
        <>
          <span>Collapse</span>
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">{SIDEBAR_SHORTCUT_LABEL}</kbd>
        </>
      )}
    </button>
  );
}
