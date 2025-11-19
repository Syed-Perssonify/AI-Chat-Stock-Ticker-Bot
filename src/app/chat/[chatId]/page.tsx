"use client";

import { use } from "react";
import { ChatInterface } from "@/components/chat/chatInterface";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { chatId } = use(params);

  return (
    <main className="h-screen overflow-hidden">
      <ChatInterface chatId={chatId} />
    </main>
  );
}
