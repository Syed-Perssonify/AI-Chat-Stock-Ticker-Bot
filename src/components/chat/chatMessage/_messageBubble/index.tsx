"use client";

import { Message } from "@/types/chat";
import { MarkdownRenderer } from "../_markdownRenderer";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "rounded-lg px-4 py-3 shadow-sm overflow-hidden",
        isUser
          ? "bg-chat-user text-foreground max-w-[85%]"
          : "bg-chat-assistant text-foreground w-[95%] max-w-[95%]"
      )}
    >
      {isUser ? (
        <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
          {message.content}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <MarkdownRenderer content={message.content} />
        </div>
      )}

      {message.isStreaming && (
        <span className="inline-flex ml-1">
          <span className="animate-pulse">▊</span>
        </span>
      )}
    </div>
  );
}
