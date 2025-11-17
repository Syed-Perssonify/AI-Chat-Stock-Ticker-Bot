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
      console.log("Sending request to /api/chat with settings:", settings);

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

      console.log("API Response status:", response.status, response.statusText);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("API Error Response:", error);
        throw new Error(
          error.error ||
            `Failed to get response: ${response.status} ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let accumulatedStreamData: {
        thinking: string[];
        toolCalls: Array<{ tool: string; input: string; timestamp: number }>;
        toolResults: Array<{ tool: string; output: string; timestamp: number }>;
        start?: { query?: string; timestamp?: string };
      } = {
        thinking: [],
        toolCalls: [],
        toolResults: [],
      };

      if (!reader) {
        throw new Error("No response body");
      }

      let hasReceivedData = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(
            "Stream completed. Total content length:",
            fullContent.length
          );
          if (!hasReceivedData && fullContent.length === 0) {
            console.warn("No data received from stream!");
          }
          break;
        }

        hasReceivedData = true;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              console.log("Received [DONE] signal");
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
              }
              if (parsed.streamData) {
                // Update accumulated stream data
                accumulatedStreamData = {
                  thinking:
                    parsed.streamData.thinking ||
                    accumulatedStreamData.thinking,
                  toolCalls:
                    parsed.streamData.toolCalls ||
                    accumulatedStreamData.toolCalls,
                  toolResults:
                    parsed.streamData.toolResults ||
                    accumulatedStreamData.toolResults,
                  start: parsed.streamData.start || accumulatedStreamData.start,
                };
              }

              // Update streaming message with both content and stream data
              setStreamingMessage({
                id: messageId,
                role: "assistant",
                content: fullContent,
                timestamp: Date.now(),
                isStreaming: true,
                streamData: accumulatedStreamData,
              });
            } catch (e) {
              console.warn("Failed to parse stream data:", data, e);
            }
          }
        }
      }

      if (fullContent.length === 0) {
        console.warn("Stream completed but no content was received!");
      }

      return { content: fullContent, streamData: accumulatedStreamData };
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

        const result = await streamOpenAIResponse(
          updatedMessages,
          assistantMessageId
        );

        if (!abortControllerRef.current?.signal.aborted) {
          const content = typeof result === "string" ? result : result.content;

          console.log("Final content length:", content?.length || 0);
          console.log(
            "Content preview:",
            content?.substring(0, 100) || "empty"
          );

          // Check if we got an empty response
          if (!content || content.trim().length === 0) {
            console.error("Received empty response from API");
            toast({
              title: "Empty Response",
              description:
                "The API returned an empty response. Please check if the DropAnalysis backend is running and try again.",
              variant: "destructive",
            });
            // Remove the user message since we got no response
            setMessages(messages);
          } else {
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: "assistant",
              content: content,
              timestamp: Date.now(),
              streamData:
                typeof result === "string" ? undefined : result.streamData,
            };

            console.log(
              "Adding assistant message to messages array:",
              assistantMessage.id
            );
            setMessages((prev) => {
              const updated = [...prev, assistantMessage];
              console.log("Messages after adding assistant:", updated.length);
              return updated;
            });
            setStreamingMessage(null);
            console.log("Streaming message cleared");
          }
        } else {
          console.log("Request was aborted, not adding message");
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
          duration: 5000,
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
