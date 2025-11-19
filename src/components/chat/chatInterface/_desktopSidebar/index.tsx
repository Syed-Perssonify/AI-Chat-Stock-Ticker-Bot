"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { ChatHistory } from "@/components/chat/chatHistory";
import { SidebarHeader } from "../_sidebarHeader";
import { screenBreakpoints } from "@/common/config/params";

interface DesktopSidebarProps {
  chats: any[];
  currentChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: () => void;
  onDelete: (chatId: string) => void;
  onNewChat: () => void;
  onSearchOpen: () => void;
}

export function DesktopSidebar({
  chats,
  currentChatId,
  onSelect,
  onCreate,
  onDelete,
  onNewChat,
  onSearchOpen,
}: DesktopSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r hidden min-[${screenBreakpoints.DESKTOP}px]:block"
    >
      <SidebarHeader onNewChat={onNewChat} onSearchOpen={onSearchOpen} />
      <SidebarContent className="group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
        <ChatHistory
          chats={chats}
          currentChatId={currentChatId}
          onSelect={onSelect}
          onCreate={onCreate}
          onDelete={onDelete}
        />
      </SidebarContent>
    </Sidebar>
  );
}
