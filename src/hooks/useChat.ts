"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, ChatSettings } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

interface UseChatProps {
  initialMessages?: Message[];
  settings: ChatSettings;
  onMessagesChange?: (messages: Message[]) => void;
}

export function useChat({
  initialMessages = [],
  settings,
  onMessagesChange,
}: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const onMessagesChangeRef = useRef(onMessagesChange);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange;
  }, [onMessagesChange]);

  // Call the callback when messages change, but don't depend on the callback itself
  useEffect(() => {
    onMessagesChangeRef.current?.(messages);
  }, [messages]);

  const streamOpenAIResponse = useCallback(
    async (messages: Message[], messageId: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          settings,
        }),
        signal: abortControllerRef.current?.signal,
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
                setStreamingMessage({
                  id: messageId,
                  role: "assistant",
                  content: fullContent,
                  timestamp: Date.now(),
                  isStreaming: true,
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullContent;
    },
    [settings]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const assistantMessageId = crypto.randomUUID();

        const finalContent = await streamOpenAIResponse(
          updatedMessages,
          assistantMessageId
        );

        if (!abortControllerRef.current?.signal.aborted) {
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: finalContent,
            timestamp: Date.now(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setStreamingMessage(null);
        }
      } catch (error: any) {
        console.error("Error sending message:", error);

        // Remove the user message if there was an error
        setMessages(messages);

        toast({
          title: "Error",
          description:
            error.message || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, messages, streamOpenAIResponse]
  );

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);

      if (streamingMessage) {
        setMessages((prev) => [
          ...prev,
          { ...streamingMessage, isStreaming: false },
        ]);
        setStreamingMessage(null);
      }
    }
  }, [streamingMessage]);

  const regenerateLastMessage = useCallback(() => {
    if (messages.length < 2) return;

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMessage) return;

    // Remove last assistant message
    setMessages((prev) => prev.slice(0, -1));

    // Resend last user message
    sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessage(null);
  }, []);

  return {
    messages,
    streamingMessage,
    isLoading,
    sendMessage,
    stopGenerating,
    regenerateLastMessage,
    clearMessages,
    setMessages,
  };
}
