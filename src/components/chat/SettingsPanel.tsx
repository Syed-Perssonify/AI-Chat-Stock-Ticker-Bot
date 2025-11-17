"use client";

import { ChatSettings, DEFAULT_SETTINGS } from "@/types/chat";
import { Separator } from "@/components/ui/separator";
import { SettingsPanelHeader } from "./settingsPanel/_settingsPanelHeader";
import { TextInputSetting } from "./settingsPanel/_textInputSetting";
import { FormTypesInput } from "./settingsPanel/_formTypesInput";
import { DatePickerSetting } from "./settingsPanel/_datePickerSetting";

interface SettingsPanelProps {
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
  onClose?: () => void;
}

export function SettingsPanel({
  settings,
  onChange,
  onClose,
}: SettingsPanelProps) {
  const handleReset = () => {
    onChange(DEFAULT_SETTINGS);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      <SettingsPanelHeader onReset={handleReset} onClose={onClose} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Stock Ticker */}
          <TextInputSetting
            id="stock-ticker"
            label="Stock Ticker"
            value={settings.stockTicker}
            onChange={(value) => onChange({ ...settings, stockTicker: value })}
            placeholder="AAPL"
            description="Company stock ticker symbol"
            required
          />

          <Separator />

          {/* Form Types */}
          <FormTypesInput
            id="form-types"
            label="Form Types"
            value={settings.formTypes}
            onChange={(value) => onChange({ ...settings, formTypes: value })}
            placeholder="10-K"
            description="Comma-separated (e.g., 10-K,10-Q) or 'all'"
            required
          />

          <Separator />

          {/* Start Date */}
          <DatePickerSetting
            id="start-date"
            label="Start Date"
            value={settings.startDate}
            onChange={(date) => onChange({ ...settings, startDate: date })}
            placeholder="Pick a start date"
            required
          />

          <Separator />

          {/* End Date */}
          <DatePickerSetting
            id="end-date"
            label="End Date"
            value={settings.endDate}
            onChange={(date) => onChange({ ...settings, endDate: date })}
            placeholder="Pick an end date"
            disabled={(date) =>
              settings.startDate ? date < settings.startDate : false
            }
            required
          />
        </div>
      </div>
    </div>
  );
}
