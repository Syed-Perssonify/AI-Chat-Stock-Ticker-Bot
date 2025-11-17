"use client";

import { useState, useCallback, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useChatHistory } from "@/hooks/useChatHistory";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DEFAULT_SETTINGS } from "@/types/chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MobileHeader } from "./chatInterface/_mobileHeader";
import { DesktopSidebar } from "./chatInterface/_desktopSidebar";
import { SearchDialog } from "./chatInterface/_searchDialog";
import { DesktopSettingsPanel } from "./chatInterface/_desktopSettingsPanel";

function ChatContent() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    chats,
    currentChatId,
    currentChat,
    createChat,
    updateChat,
    deleteChat,
    selectChat,
    generateChatTitle,
    isHydrated,
  } = useChatHistory();

  const [settings, setSettings] = useState(
    currentChat?.settings || DEFAULT_SETTINGS
  );

  const handleMessagesChange = useCallback(
    (messages: any[]) => {
      if (currentChatId) {
        const title =
          messages.length === 1
            ? generateChatTitle(messages[0].content)
            : currentChat?.title || "New Chat";

        updateChat(currentChatId, { messages, title });
      }
    },
    [currentChatId, currentChat?.title, updateChat, generateChatTitle]
  );

  const {
    messages,
    streamingMessage,
    isLoading,
    sendMessage,
    stopGenerating,
    regenerateLastMessage,
    setMessages,
  } = useChat({
    initialMessages: currentChat?.messages || [],
    settings,
    onMessagesChange: handleMessagesChange,
  });

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages);
      setSettings(currentChat.settings);
    }
  }, [currentChatId, setMessages]);

  const handleNewChat = () => {
    const newChat = createChat("New Chat", settings);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    setSidebarOpen(false);
  };

  const handleSettingsChange = (newSettings: any) => {
    setSettings(newSettings);
    if (currentChatId) {
      updateChat(currentChatId, { settings: newSettings });
    }
  };

  // Create initial chat if none exists (only after hydration)
  useEffect(() => {
    if (isHydrated && chats.length === 0) {
      createChat();
    }
  }, [isHydrated, chats.length, createChat]);

  return (
    <div className="h-screen flex overflow-hidden bg-background w-full">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onSearchOpen={() => setSearchOpen(true)}
          chats={chats}
          currentChatId={currentChatId}
          deleteChat={deleteChat}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <DesktopSidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelect={selectChat}
          onCreate={handleNewChat}
          onDelete={deleteChat}
          onNewChat={handleNewChat}
          onSearchOpen={() => setSearchOpen(true)}
        />
      )}

      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        chats={chats}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          isMobile && "pt-16"
        )}
      >
        <MessageList
          messages={messages}
          streamingMessage={streamingMessage}
          onRegenerate={regenerateLastMessage}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          onStop={stopGenerating}
        />
      </div>

      {/* Desktop Settings Panel - Always Visible */}
      {!isMobile && (
        <DesktopSettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
        />
      )}
    </div>
  );
}

export function ChatInterface() {
  // Always start with true on server, then sync on client
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    // Read sidebar state from cookie on client side only
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split("; ");
      const sidebarCookie = cookies.find((c) => c.startsWith("sidebar:state="));
      if (sidebarCookie) {
        const isOpen = sidebarCookie.split("=")[1] === "true";
        setDefaultOpen(isOpen);
      }
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ChatContent />
    </SidebarProvider>
  );
}
