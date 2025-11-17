"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormTypesInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
}

export function FormTypesInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  description,
}: FormTypesInputProps) {
  const handleToggleAll = () => {
    onChange(value.toLowerCase() === "all" ? "" : "all");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="cursor-text flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleToggleAll}
          className="shrink-0 bg-primary text-white aspect-square"
        >
          ALL
        </Button>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
