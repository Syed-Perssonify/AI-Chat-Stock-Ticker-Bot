"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { SettingsPanel } from "../index";
import { ChatSettings } from "@/types/chat";
import { cn } from "@/lib/utils";

interface SettingsWrapperProps {
  variant: "desktop" | "mobile";
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
  // Mobile-specific props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  // Desktop-specific props
  className?: string;
}

export function SettingsWrapper({
  variant,
  settings,
  onChange,
  open,
  onOpenChange,
  trigger,
  className,
}: SettingsWrapperProps) {
  if (variant === "desktop") {
    return (
      <div className={cn("w-80 shrink-0 border-l", className)}>
        <SettingsPanel settings={settings} onChange={onChange} />
      </div>
    );
  }

  // Mobile variant
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side="right"
        className="p-0 w-[85vw] sm:w-[380px] [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Settings</SheetTitle>
        <div className="h-full flex flex-col">
          <SettingsPanel
            settings={settings}
            onChange={onChange}
            onClose={() => onOpenChange?.(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Convenience component for mobile with default trigger button
interface MobileSettingsWrapperProps {
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSettingsWrapper({
  settings,
  onChange,
  open,
  onOpenChange,
}: MobileSettingsWrapperProps) {
  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-9 w-9">
      <Settings className="h-5 w-5" />
    </Button>
  );

  return (
    <SettingsWrapper
      variant="mobile"
      settings={settings}
      onChange={onChange}
      open={open}
      onOpenChange={onOpenChange}
      trigger={defaultTrigger}
    />
  );
}

// Convenience component for desktop
interface DesktopSettingsWrapperProps {
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
  className?: string;
}

export function DesktopSettingsWrapper({
  settings,
  onChange,
  className,
}: DesktopSettingsWrapperProps) {
  return (
    <SettingsWrapper
      variant="desktop"
      settings={settings}
      onChange={onChange}
      className={className}
    />
  );
}
