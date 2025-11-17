"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: ReactNode;
  tooltip: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function ActionButton({
  icon,
  tooltip,
  onClick,
  active,
  className,
}: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 sm:h-8 sm:w-8 cursor-pointer border border-border hover:bg-primary shrink-0",
            active
              ? "bg-primary text-primary-foreground hover:bg-primary"
              : "hover:bg-primary",
            className
          )}
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
