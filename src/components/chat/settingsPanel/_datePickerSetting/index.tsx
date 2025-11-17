"use client";

import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerSettingProps {
  id: string;
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  required?: boolean;
  inputDisabled?: boolean;
}

export function DatePickerSetting({
  id,
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  required = false,
  inputDisabled = false,
}: DatePickerSettingProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal cursor-pointer",
              !value && "text-muted-foreground"
            )}
            disabled={inputDisabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(date) => onChange(date || null)}
            initialFocus
            disabled={disabled}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={new Date().getFullYear() + 1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
