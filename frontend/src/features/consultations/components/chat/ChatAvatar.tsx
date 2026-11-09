import React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";

interface ChatAvatarProps {
  name: string;
  className: string;
  /** Green dot in the corner, like Messenger's "Active now". */
  isActive?: boolean;
}

export function ChatAvatar({ name, className, isActive = false }: ChatAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        className
      )}
    >
      {getInitials(name)}
      {isActive && (
        <span className="absolute bottom-0 right-0 h-[30%] min-h-2 w-[30%] min-w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
      )}
    </span>
  );
}
