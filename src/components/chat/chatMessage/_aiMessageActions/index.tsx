"use client";

import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share2,
  RotateCcw,
  Flag,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ActionButton } from "../_actionButton";

interface AIMessageActionsProps {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFlag: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  flagged: boolean;
  thumbsUp: boolean;
  thumbsDown: boolean;
}

export function AIMessageActions({
  onCopy,
  onRegenerate,
  onFlag,
  onThumbsUp,
  onThumbsDown,
  flagged,
  thumbsUp,
  thumbsDown,
}: AIMessageActionsProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme || "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
      <ActionButton
        icon={<Copy className="h-4 w-4" />}
        tooltip="Copy"
        onClick={onCopy}
      />
      <ActionButton
        icon={<ThumbsUp className="h-4 w-4" />}
        tooltip={thumbsUp ? "Remove thumbs up" : "Thumbs up"}
        onClick={onThumbsUp}
        active={thumbsUp}
      />
      <ActionButton
        icon={<ThumbsDown className="h-4 w-4" />}
        tooltip={thumbsDown ? "Remove thumbs down" : "Thumbs down"}
        onClick={onThumbsDown}
        active={thumbsDown}
      />
      <ActionButton icon={<Share2 className="h-4 w-4" />} tooltip="Share" />
      <ActionButton
        icon={<RotateCcw className="h-4 w-4" />}
        tooltip="Refresh"
        onClick={onRegenerate}
      />
      {mounted && (
        <ActionButton
          icon={
            isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          }
          tooltip={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        />
      )}
      <ActionButton
        icon={<Flag className="h-4 w-4" />}
        tooltip={flagged ? "Unflag message" : "Flag message"}
        onClick={onFlag}
        active={flagged}
      />
    </div>
  );
}
