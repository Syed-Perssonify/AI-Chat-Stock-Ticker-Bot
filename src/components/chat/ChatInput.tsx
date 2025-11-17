"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Square, Paperclip, X, FileText, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTypingPlaceholder } from "@/hooks/useTypingPlaceholder";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  onStop?: () => void;
}

export function ChatInput({
  onSend,
  isLoading,
  disabled = false,
  onStop,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Typing animation for placeholder
  const placeholderTexts = [
    "Basic 10-K Review",
    "3-Year Timeline Analysis",
    "Multiple Form Comparison",
    "Date Range Evaluation",
    "Stock Performance Analysis",
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

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim(), selectedFiles);
      setInput("");
      setSelectedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ctrl+D for documents
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        documentInputRef.current?.click();
      }
      // Ctrl+I for images
      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        imageInputRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;

    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only select up to ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;

    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only select up to ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    e.target.value = "";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;

    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only select up to ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const isEmpty = !input.trim();
  const canSend = !isEmpty && !disabled;

  return (
    <div className="border-t bg-background p-4 shrink-0">
      <div className="mx-auto max-w-4xl px-4">
        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedFiles.map((file, index) => (
              <Badge
                key={index}
                variant="outline"
                className="gap-2 pr-1 max-w-[200px]"
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate text-xs">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

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

          {/* Attach File Button (Left Side) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

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

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={documentInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
          onChange={handleDocumentSelect}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <p className="mt-2 text-xs text-muted-foreground text-center">
          Press Enter to send, Shift+Enter for new line • Ctrl+D for documents
        </p>
      </div>
    </div>
  );
}
