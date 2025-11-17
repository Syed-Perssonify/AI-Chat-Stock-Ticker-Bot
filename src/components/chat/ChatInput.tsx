"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Square, ArrowUp, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTypingPlaceholder } from "@/hooks/useTypingPlaceholder";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ChatInputProps {
  onSend: (message: string, files?: File[], deepAnalysis?: boolean) => void;
  isLoading: boolean;
  disabled?: boolean;
  onStop?: () => void;
  deepAnalysis?: boolean;
  onDeepAnalysisChange?: (enabled: boolean) => void;
  settings?: {
    stockTicker?: string;
    formTypes?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  };
}

export function ChatInput({
  onSend,
  isLoading,
  disabled = false,
  onStop,
  deepAnalysis = false,
  onDeepAnalysisChange,
  settings,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Typing animation for placeholder
  const placeholderTexts = [
    "Analyze Apple's latest 10-K filing",
    "Compare revenue trends for AAPL and MSFT",
    "What are Tesla's main risk factors?",
    "Show financial highlights from latest 10-Q",
    "Analyze business segments and operations",
    "Extract XBRL data for cash flow analysis",
    "Compare filings across last 3 years",
    "Identify key risk factors and concerns",
    "Evaluate strategic initiatives and goals",
    "Show financial performance metrics",
    "Compare revenue sources and breakdown",
    "Show top expenses and cost structure",
    "Show top assets and liabilities",
    "Show top shareholders and ownership",
    "Show top management and compensation",
    "Show top competitors and market share",
    "Show top news and events",
  ];
  const typingPlaceholder = useTypingPlaceholder(
    placeholderTexts,
    80,
    40,
    1500
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 80);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const validateSettings = (): { valid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    if (!settings?.stockTicker?.trim()) {
      missingFields.push("Stock Ticker");
    }
    if (!settings?.formTypes?.trim()) {
      missingFields.push("Form Types");
    }
    if (!settings?.startDate) {
      missingFields.push("Start Date");
    }
    if (!settings?.endDate) {
      missingFields.push("End Date");
    }

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;

    // Validate settings before sending
    const validation = validateSettings();
    if (!validation.valid) {
      toast({
        title: "Settings Required",
        description: `Please fill in all required settings: ${validation.missingFields.join(
          ", "
        )}`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    // All settings are valid, proceed with sending
    onSend(input.trim(), undefined, deepAnalysis);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  const handleDeepAnalysisToggle = () => {
    const newState = !deepAnalysis;
    onDeepAnalysisChange?.(newState);

    // Show toast notification
    toast({
      title: newState ? "Deep Analysis Enabled" : "Deep Analysis Disabled",
      description: newState
        ? "Multi-filing timeline analysis will be performed. This may take 1-3 minutes."
        : "Using standard analysis mode for faster responses.",
      duration: 3000,
    });
  };

  const isEmpty = !input.trim();
  const validation = validateSettings();
  const canSend = !isEmpty && !disabled && validation.valid;

  return (
    <div className="border-t bg-background p-4 shrink-0">
      <div className="mx-auto max-w-4xl px-4">
        {/* Input Area */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={input ? "" : typingPlaceholder}
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-[80px] resize-none pl-11 pr-14 py-2.5 w-full",
              "focus-visible:ring-primary"
            )}
            rows={1}
          />

          {/* Deep Analysis Button (Left Side) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative h-8 w-8",
                      deepAnalysis
                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={handleDeepAnalysisToggle}
                    disabled={disabled}
                  >
                    <BrainCircuit
                      className={cn(
                        "h-4 w-4",
                        deepAnalysis
                          ? "text-primary-foreground fill-primary-foreground"
                          : ""
                      )}
                    />
                    {/* Active indicator badge */}
                    {deepAnalysis && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-primary-foreground border-2 border-primary rounded-full"
                      />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {deepAnalysis ? "Deep Analysis: ON" : "Deep Analysis: OFF"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {deepAnalysis
                    ? "Multi-filing timeline analysis enabled"
                    : "Click to enable deep timeline analysis"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Send/Stop Button (Right Side) */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Button
                size="icon"
                onClick={handleStop}
                className="h-10 w-10 bg-destructive hover:bg-destructive/90"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "h-8 w-8 rounded-lg",
                  canSend && "bg-primary hover:bg-primary"
                )}
              >
                <ArrowUp className="h-3.5 w-3.5 text-primary-foreground" />
              </Button>
            )}
          </div>
        </div>

        {/* Settings validation message */}
        {!validation.valid && input.trim() && (
          <p className="mt-2 text-xs text-destructive text-center">
            ⚠️ Please complete all settings:{" "}
            {validation.missingFields.join(", ")}
          </p>
        )}
        {validation.valid && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  );
}
