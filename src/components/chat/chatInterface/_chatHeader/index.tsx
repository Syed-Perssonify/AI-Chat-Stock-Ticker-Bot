"use client";

import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  chatTitle?: string | null;
  isNewChat?: boolean;
}

export function ChatHeader({ chatTitle, isNewChat }: ChatHeaderProps) {
  const displayTitle = chatTitle || "New Chat";

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 shrink-0">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                "text-base font-semibold truncate",
                isNewChat && "text-muted-foreground"
              )}
            >
              {displayTitle}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
