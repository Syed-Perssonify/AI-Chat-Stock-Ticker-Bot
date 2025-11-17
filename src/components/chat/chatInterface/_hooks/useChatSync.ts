import { useEffect, useRef } from "react";

interface UseChatSyncProps {
  chatId: string | undefined;
  currentChatId: string | null;
  selectChat: (chatId: string) => void;
}

export function useChatSync({
  chatId,
  currentChatId,
  selectChat,
}: UseChatSyncProps) {
  const lastSyncedChatIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only sync if we have a chatId from URL and it's different from current
    // AND we haven't already synced this chatId
    if (
      chatId &&
      chatId !== currentChatId &&
      lastSyncedChatIdRef.current !== chatId
    ) {
      lastSyncedChatIdRef.current = chatId;
      selectChat(chatId);
    } else if (chatId === currentChatId) {
      // Update ref when chatId matches to allow future syncs if needed
      lastSyncedChatIdRef.current = chatId;
    } else if (!chatId && lastSyncedChatIdRef.current !== undefined) {
      // Reset when no chatId (on /new route)
      lastSyncedChatIdRef.current = undefined;
    }
  }, [chatId, currentChatId, selectChat]);
}
