"use client";

import { Button } from "@/components/ui/button";
import { RefObject } from "react";

interface MessageEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
}

export function MessageEditor({
  content,
  onContentChange,
  onSave,
  onCancel,
  textareaRef,
}: MessageEditorProps) {
  return (
    <div className="flex-1 -mx-6 px-6">
      <div className="relative w-full rounded-lg bg-muted/50 border border-border p-4 space-y-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none resize-none text-foreground overflow-hidden min-h-[4rem] text-base leading-relaxed"
          placeholder="Edit your message..."
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onCancel();
            }
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              onSave();
            }
          }}
          autoFocus
        />
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 px-4 cursor-pointer bg-background hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              className="h-8 px-4 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
