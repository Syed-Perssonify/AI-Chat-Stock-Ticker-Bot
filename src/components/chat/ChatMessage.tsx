"use client";

import { Message } from "@/types/chat";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MessageAvatar } from "./chatMessage/_messageAvatar";
import { MessageEditor } from "./chatMessage/_messageEditor";
import { MessageBubble } from "./chatMessage/_messageBubble";
import { AIMessageActions } from "./chatMessage/_aiMessageActions";
import { UserMessageActions } from "./chatMessage/_userMessageActions";
import { StreamDataView } from "./chatMessage/_streamDataView";

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  showActions?: boolean;
}

export function ChatMessage({
  message,
  onRegenerate,
  onEditMessage,
  showActions = true,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [messageFeedback, setMessageFeedback] = useLocalStorage<{
    [messageId: string]: {
      thumbsUp: boolean;
      thumbsDown: boolean;
      flagged: boolean;
    };
  }>("message-feedback", {});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUser = message.role === "user";

  // Get feedback state for this message
  const feedback = messageFeedback[message.id] || {
    thumbsUp: false,
    thumbsDown: false,
    flagged: false,
  };
  const thumbsUp = feedback.thumbsUp;
  const thumbsDown = feedback.thumbsDown;
  const persistedFlagged = feedback.flagged;

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedContent, isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message content.",
        variant: "destructive",
      });
    }
  };

  const handleFlag = () => {
    const newFlagged = !persistedFlagged;
    setMessageFeedback((prev) => ({
      ...prev,
      [message.id]: {
        ...(prev[message.id] || {
          thumbsUp: false,
          thumbsDown: false,
          flagged: false,
        }),
        flagged: newFlagged,
      },
    }));
    toast({
      title: newFlagged ? "Flagged" : "Unflagged",
      description: newFlagged
        ? "Message flagged for review."
        : "Message unflagged successfully.",
    });
  };

  const handleThumbsUp = () => {
    const newThumbsUp = !thumbsUp;
    setMessageFeedback((prev) => ({
      ...prev,
      [message.id]: {
        ...(prev[message.id] || {
          thumbsUp: false,
          thumbsDown: false,
          flagged: persistedFlagged,
        }),
        thumbsUp: newThumbsUp,
        thumbsDown: newThumbsUp ? false : prev[message.id]?.thumbsDown || false,
      },
    }));
    if (newThumbsUp) {
      toast({
        title: "Thanks for your feedback!",
        description: "Your positive feedback helps us improve.",
      });
    }
  };

  const handleThumbsDown = () => {
    const newThumbsDown = !thumbsDown;
    setMessageFeedback((prev) => ({
      ...prev,
      [message.id]: {
        ...(prev[message.id] || {
          thumbsUp: false,
          thumbsDown: false,
          flagged: persistedFlagged,
        }),
        thumbsDown: newThumbsDown,
        thumbsUp: newThumbsDown ? false : prev[message.id]?.thumbsUp || false,
      },
    }));
    if (newThumbsDown) {
      toast({
        title: "Thanks for your feedback!",
        description: "Your feedback helps us improve.",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() !== message.content && editedContent.trim()) {
      // Call onEditMessage to update the message and send it
      if (onEditMessage) {
        onEditMessage(message.id, editedContent.trim());
      } else {
        // Fallback: just update locally
        toast({
          title: "Message edited",
          description: "Changes saved successfully.",
        });
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex gap-2 sm:gap-4 p-3 sm:p-6 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <MessageAvatar isUser={isUser} />

      {isEditing && isUser ? (
        <MessageEditor
          content={editedContent}
          onContentChange={setEditedContent}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          textareaRef={textareaRef}
        />
      ) : (
        <div
          className={cn(
            "flex-1 flex flex-col space-y-2 overflow-hidden",
            isUser ? "items-end" : "items-start"
          )}
        >
          {/* Stream Data View - Only for assistant messages with stream data */}
          {!isUser && message.streamData && (
            <StreamDataView streamData={message.streamData} />
          )}
          <MessageBubble message={message} isUser={isUser} />

          <div
            className={cn(
              "items-center gap-2 text-xs text-muted-foreground hidden",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <span>{format(message.timestamp, "HH:mm")}</span>
          </div>

          {showActions && !isUser && (
            <AIMessageActions
              onCopy={handleCopy}
              onRegenerate={onRegenerate}
              onFlag={handleFlag}
              onThumbsUp={handleThumbsUp}
              onThumbsDown={handleThumbsDown}
              flagged={persistedFlagged}
              thumbsUp={thumbsUp}
              thumbsDown={thumbsDown}
            />
          )}

          {showActions && isUser && (
            <UserMessageActions
              onCopy={handleCopy}
              onEdit={handleEdit}
              onFlag={handleFlag}
              copied={copied}
              flagged={persistedFlagged}
              isEditing={isEditing}
            />
          )}
        </div>
      )}
    </div>
  );
}
