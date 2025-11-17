"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
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
import { ROUTES } from "@/common/routes";
import { useChatRouting } from "./chatInterface/_hooks/useChatRouting";
import { useChatSync } from "./chatInterface/_hooks/useChatSync";
import { useMessageEditing } from "./chatInterface/_hooks/useMessageEditing";
import { useChatMessages } from "./chatInterface/_hooks/useChatMessages";
import { useChatTitle } from "./chatInterface/_hooks/useChatTitle";
import { ChatHeader } from "./chatInterface/_chatHeader";

interface ChatContentProps {
  chatId?: string;
}

function ChatContent({ chatId: chatIdProp }: ChatContentProps) {
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Get chatId from props or URL params
  const chatIdFromUrl = params?.chatId as string | undefined;
  const chatId = chatIdProp || chatIdFromUrl;
  const isNewChatRoute = pathname === ROUTES.NEW_CHAT;

  const {
    chats,
    currentChatId,
    currentChat,
    createChat,
    updateChat,
    deleteChat,
    selectChat,
    generateChatTitle,
  } = useChatHistory();

  // Track newly created chatId for immediate use
  const newlyCreatedChatIdRef = useRef<string | undefined>(undefined);

  // Sync URL chatId with currentChatId
  useChatSync({ chatId, currentChatId, selectChat });

  const [settings, setSettings] = useState(
    currentChat?.settings || DEFAULT_SETTINGS
  );

  // Handle chat title generation and message updates
  const { handleMessagesChange } = useChatTitle({
    currentChatId,
    chatId,
    currentChat,
    updateChat,
    generateChatTitle,
    newlyCreatedChatIdRef,
  });

  const {
    messages,
    streamingMessage,
    isLoading,
    sendMessage: originalSendMessage,
    stopGenerating,
    regenerateLastMessage,
    setMessages,
  } = useChat({
    initialMessages: currentChat?.messages || [],
    settings,
    onMessagesChange: handleMessagesChange,
  });

  // Handle routing and message sending
  const {
    sendMessage,
    handleNewChat: baseHandleNewChat,
    handleSelectChat,
  } = useChatRouting({
    isNewChatRoute,
    messagesLength: messages.length,
    createChat,
    selectChat,
    settings,
    originalSendMessage,
    newlyCreatedChatIdRef,
    currentChatId,
  });

  const handleNewChat = () => {
    setMessages([]);
    setSidebarOpen(false);
    baseHandleNewChat();
  };

  // Sync messages when chat changes
  useChatMessages({
    chatId,
    currentChatId,
    currentChat,
    isNewChatRoute,
    setMessages,
    setSettings,
    newlyCreatedChatIdRef,
    currentMessagesLength: messages.length,
  });

  // Handle message editing
  const { handleEditMessage } = useMessageEditing({
    messages,
    setMessages,
    settings,
    isLoading,
  });

  const handleSettingsChange = (newSettings: any) => {
    setSettings(newSettings);
    if (currentChatId) {
      updateChat(currentChatId, { settings: newSettings });
    }
  };

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
          onSelect={handleSelectChat}
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
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          isMobile && "pt-16"
        )}
      >
        {/* Chat Header - Shows current chat title */}
        <ChatHeader
          chatTitle={currentChat?.title}
          isNewChat={isNewChatRoute || !currentChatId}
        />
        <MessageList
          messages={messages}
          streamingMessage={streamingMessage}
          onRegenerate={regenerateLastMessage}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onEditMessage={handleEditMessage}
        />
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          onStop={stopGenerating}
          deepAnalysis={settings.deepAnalysis}
          onDeepAnalysisChange={(enabled) => {
            const newSettings = { ...settings, deepAnalysis: enabled };
            setSettings(newSettings);
            if (currentChatId) {
              updateChat(currentChatId, { settings: newSettings });
            }
          }}
          settings={settings}
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

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface(
  { chatId }: ChatInterfaceProps = {} as ChatInterfaceProps
) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Set sidebar state based on screen size
    const updateSidebarState = () => {
      if (typeof window !== "undefined") {
        const isLargeScreen = window.innerWidth >= 1080;
        if (isLargeScreen) {
          // On large screens, read from cookie or default to true
          const cookies = document.cookie.split("; ");
          const sidebarCookie = cookies.find((c) =>
            c.startsWith("sidebar:state=")
          );
          if (sidebarCookie) {
            const isOpen = sidebarCookie.split("=")[1] === "true";
            setSidebarOpen(isOpen);
          } else {
            setSidebarOpen(true);
          }
        } else {
          // On small screens, always force closed
          setSidebarOpen(false);
        }
      }
    };

    // Set initial state
    updateSidebarState();

    // Update on window resize
    window.addEventListener("resize", updateSidebarState);
    return () => window.removeEventListener("resize", updateSidebarState);
  }, []);

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={(open) => {
        // Only allow opening on large screens
        if (typeof window !== "undefined" && window.innerWidth >= 1080) {
          setSidebarOpen(open);
        } else {
          // Force closed on small screens
          setSidebarOpen(false);
        }
      }}
    >
      <ChatContent chatId={chatId} />
    </SidebarProvider>
  );
}
