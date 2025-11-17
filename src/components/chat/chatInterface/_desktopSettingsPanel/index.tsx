"use client";

import { SettingsPanel } from "@/components/chat/SettingsPanel";

interface DesktopSettingsPanelProps {
  settings: any;
  onChange: (settings: any) => void;
}

export function DesktopSettingsPanel({
  settings,
  onChange,
}: DesktopSettingsPanelProps) {
  return (
    <div className="w-80 shrink-0 border-l">
      <SettingsPanel settings={settings} onChange={onChange} />
    </div>
  );
}
