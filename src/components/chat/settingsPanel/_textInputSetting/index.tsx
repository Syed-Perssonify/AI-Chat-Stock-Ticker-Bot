"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TextInputSettingProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export function TextInputSetting({
  id,
  label,
  value,
  onChange,
  placeholder,
  description,
  required = false,
}: TextInputSettingProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="cursor-text"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
