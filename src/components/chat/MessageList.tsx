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
}

export function MessageList({
  messages,
  streamingMessage,
  onRegenerate,
  isLoading,
  onSendMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState("Good afternoon");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
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

    // Time-based greetings (60% of the time)
    if (Math.random() < 0.6) {
      if (currentHour < 12) {
        selectedGreeting = greetings[0]; // Good morning
      } else if (currentHour < 18) {
        selectedGreeting = greetings[1]; // Good afternoon
      } else {
        selectedGreeting = greetings[2]; // Good evening
      }
    } else {
      // Random work-related greeting (40% of the time)
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
    <div className="flex-1 overflow-y-auto" ref={scrollRef}>
      <div className="mx-auto max-w-6xl px-6 py-4">
        {allMessages.map((message, index) => (
          <ChatMessage
            key={`${message.id}-${message.isStreaming ? "streaming" : "final"}`}
            message={message}
            onRegenerate={
              index === allMessages.length - 1 && message.role === "assistant"
                ? onRegenerate
                : undefined
            }
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
