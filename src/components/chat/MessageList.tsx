"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  messages: Message[];
  streamingMessage?: Message | null;
  onRegenerate?: () => void;
  isLoading?: boolean;
  onSendMessage?: (message: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

export function MessageList({
  messages,
  streamingMessage,
  onRegenerate,
  isLoading,
  onSendMessage,
  onEditMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState("Good afternoon");
  const isUserScrolledUpRef = useRef(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isUserScrolledUpRef.current = distanceFromBottom > 100;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || isUserScrolledUpRef.current) return;

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    });
  }, [messages, streamingMessage]);

  useEffect(() => {
    const greetings = [
      "Good morning",
      "Good afternoon ",
      "Good evening",
      "What are we creating today?",
      "Time to be productive",
      "What's on your mind?",
      "Let's make progress today",
      "Let's get to work",
    ];

    const currentHour = new Date().getHours();
    let selectedGreeting;

    if (Math.random() < 0.6) {
      if (currentHour < 12) {
        selectedGreeting = greetings[0];
      } else if (currentHour < 18) {
        selectedGreeting = greetings[1];
      } else {
        selectedGreeting = greetings[2];
      }
    } else {
      const workGreetings = greetings.slice(3);
      selectedGreeting =
        workGreetings[Math.floor(Math.random() * workGreetings.length)];
    }

    setGreeting(selectedGreeting);
  }, []);

  const allMessages = [...messages];
  if (streamingMessage) {
    allMessages.push(streamingMessage);
  }

  if (allMessages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground">
            {greeting}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden" ref={scrollRef}>
      <div className="mx-auto max-w-6xl px-6 py-4 w-full">
        {allMessages.map((message, index) => (
          <ChatMessage
            key={`${message.id}-${message.isStreaming ? "streaming" : "final"}`}
            message={message}
            onRegenerate={
              index === allMessages.length - 1 && message.role === "assistant"
                ? onRegenerate
                : undefined
            }
            onEditMessage={onEditMessage}
            showActions={!message.isStreaming}
          />
        ))}
        {isLoading && !streamingMessage && (
          <div className="flex gap-4 p-6 animate-fade-in">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
