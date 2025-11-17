import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, getChatRoute } from "@/common/routes";
import { ChatSettings } from "@/types/chat";

interface UseChatRoutingProps {
  isNewChatRoute: boolean;
  messagesLength: number;
  createChat: (title?: string, settings?: ChatSettings) => any;
  selectChat: (chatId: string) => void;
  settings: ChatSettings;
  originalSendMessage: (content: string) => Promise<void>;
  newlyCreatedChatIdRef: React.MutableRefObject<string | undefined>;
  currentChatId: string | null;
}

export function useChatRouting({
  isNewChatRoute,
  messagesLength,
  createChat,
  selectChat,
  settings,
  originalSendMessage,
  newlyCreatedChatIdRef,
  currentChatId,
}: UseChatRoutingProps) {
  const router = useRouter();
  const currentChatIdRef = useRef(currentChatId);

  // Keep ref in sync with currentChatId
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  const sendMessage = useCallback(
    async (content: string, files?: File[], deepAnalysis?: boolean) => {
      // Update settings with deepAnalysis if provided
      if (
        deepAnalysis !== undefined &&
        deepAnalysis !== settings.deepAnalysis
      ) {
        const newSettings = { ...settings, deepAnalysis };
        // Update settings in the chat if it exists
        // Note: This will be handled by the parent component
      }

      // If on /new route and no messages, create new chat first
      if (isNewChatRoute && messagesLength === 0) {
        const newChat = createChat("New Chat", settings);
        const newChatId = newChat.id;

        // Store the new chatId in ref so handleMessagesChange can use it immediately
        newlyCreatedChatIdRef.current = newChatId;
        // Select the chat immediately so it's available for message sending
        selectChat(newChatId);
        // Navigate to the chat route (use replace to avoid back button issues)
        router.replace(getChatRoute(newChatId));

        // Wait for navigation and state updates to complete
        // Poll until currentChatId matches the new chat ID to ensure state is synced
        // Use ref to access latest value in the polling loop
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds max wait (20 * 100ms)

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Check if the chat is now selected (using ref to get latest value)
          if (currentChatIdRef.current === newChatId) {
            // Additional wait for component re-render
            await new Promise((resolve) => requestAnimationFrame(resolve));
            break;
          }
          attempts++;
        }
      }

      // Send the message - this will work because chat is now selected
      await originalSendMessage(content);
    },
    [
      isNewChatRoute,
      messagesLength,
      createChat,
      settings,
      selectChat,
      router,
      originalSendMessage,
      newlyCreatedChatIdRef,
      currentChatId,
    ]
  );

  const handleNewChat = useCallback(
    (onClearMessages?: () => void, onCloseSidebar?: () => void) => {
      onClearMessages?.();
      onCloseSidebar?.();
      router.push(ROUTES.NEW_CHAT);
    },
    [router]
  );

  const handleSelectChat = useCallback(
    (chatId: string) => {
      selectChat(chatId);
      router.push(getChatRoute(chatId));
    },
    [selectChat, router]
  );

  return {
    sendMessage,
    handleNewChat,
    handleSelectChat,
  };
}
