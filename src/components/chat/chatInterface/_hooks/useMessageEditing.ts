import { useCallback } from "react";
import { Message, ChatSettings } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

interface UseMessageEditingProps {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  settings: ChatSettings;
  isLoading: boolean;
}

export function useMessageEditing({
  messages,
  setMessages,
  settings,
  isLoading,
}: UseMessageEditingProps) {
  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      // Find the index of the message being edited
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);

      if (messageIndex === -1) return;

      // Update the message content
      const updatedMessages = messages.map((msg, index) => {
        if (index === messageIndex) {
          return { ...msg, content: newContent };
        }
        return msg;
      });
      const messagesUpToEdit = updatedMessages.slice(0, messageIndex + 1);

      setMessages(messagesUpToEdit);

      if (isLoading) return;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messagesUpToEdit.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            settings,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (!reader) {
          throw new Error("No response body");
        }

        const assistantMessageId = crypto.randomUUID();
        let streamingContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  streamingContent = fullContent;
                  // Update messages with streaming content
                  setMessages((prev) => {
                    const withoutStreaming = prev.filter((m) => !m.isStreaming);
                    return [
                      ...withoutStreaming,
                      {
                        id: assistantMessageId,
                        role: "assistant" as const,
                        content: streamingContent,
                        timestamp: Date.now(),
                        isStreaming: true,
                      },
                    ];
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Add final assistant message
        setMessages((prev) => {
          const withoutStreaming = prev.filter((m) => !m.isStreaming);
          return [
            ...withoutStreaming,
            {
              id: assistantMessageId,
              role: "assistant" as const,
              content: fullContent,
              timestamp: Date.now(),
            },
          ];
        });
      } catch (error: any) {
        console.error("Error sending edited message:", error);
        toast({
          title: "Error",
          description:
            error.message || "Failed to send edited message. Please try again.",
          variant: "destructive",
        });
      }
    },
    [messages, setMessages, settings, isLoading]
  );

  return { handleEditMessage };
}
