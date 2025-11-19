"use client";

import { Button } from "@/components/ui/button";
import { ChatHistory } from "@/components/chat/chatHistory";
import { CircleFadingPlus, Search } from "lucide-react";

interface MobileSidebarProps {
  onNewChat: () => void;
  onSearchOpen: () => void;
  chats: any[];
  currentChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: () => void;
  onDelete: (chatId: string) => void;
}

export function MobileSidebar({
  onNewChat,
  onSearchOpen,
  chats,
  currentChatId,
  onSelect,
  onCreate,
  onDelete,
}: MobileSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-1 border-b">
        <Button
          onClick={onNewChat}
          variant="ghost"
          className="w-full gap-2 justify-start h-auto py-2 px-3 font-normal"
        >
          <CircleFadingPlus className="h-4 w-4 shrink-0" />
          <span>New chat</span>
        </Button>
        <Button
          onClick={onSearchOpen}
          variant="ghost"
          className="w-full gap-2 justify-start h-auto py-2 px-3 font-normal"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span>Search chats</span>
        </Button>
      </div>
      <ChatHistory
        chats={chats}
        currentChatId={currentChatId}
        onSelect={onSelect}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    </div>
  );
}
