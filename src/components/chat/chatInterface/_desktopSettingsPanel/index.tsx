"use client";

import { DesktopSettingsWrapper } from "@/components/chat/settingsPanel/_settingsWrapper";
import { ChatSettings } from "@/types/chat";

interface DesktopSettingsPanelProps {
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
}

export function DesktopSettingsPanel({
  settings,
  onChange,
}: DesktopSettingsPanelProps) {
  return <DesktopSettingsWrapper settings={settings} onChange={onChange} />;
}
