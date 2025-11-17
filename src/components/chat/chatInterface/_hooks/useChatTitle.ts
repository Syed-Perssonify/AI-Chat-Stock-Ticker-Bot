import { useCallback } from "react";
import { Message } from "@/types/chat";

interface UseChatTitleProps {
  currentChatId: string | null;
  chatId: string | undefined;
  currentChat: any;
  updateChat: (chatId: string, updates: any) => void;
  generateChatTitle: (firstMessage: string) => string;
  newlyCreatedChatIdRef: React.MutableRefObject<string | undefined>;
}

export function useChatTitle({
  currentChatId,
  chatId,
  currentChat,
  updateChat,
  generateChatTitle,
  newlyCreatedChatIdRef,
}: UseChatTitleProps) {
  const handleMessagesChange = useCallback(
    (messages: Message[]) => {
      if (messages.length === 0) return;

      // Determine which chatId to use - prioritize newly created, then currentChatId, then chatId from URL
      const targetChatId =
        newlyCreatedChatIdRef.current || currentChatId || chatId;
      if (!targetChatId) return;

      // Clear the newly created ref once we've used it
      if (newlyCreatedChatIdRef.current === targetChatId) {
        newlyCreatedChatIdRef.current = undefined;
      }

      // Generate title from first user message if we don't have a proper title yet
      const firstUserMessage = messages.find((m) => m.role === "user");
      const shouldGenerateTitle =
        !currentChat?.title ||
        currentChat.title === "New Chat" ||
        messages.length === 1;

      const title =
        shouldGenerateTitle && firstUserMessage
          ? generateChatTitle(firstUserMessage.content)
          : currentChat?.title || "New Chat";

      // Always update the chat with messages and title
      updateChat(targetChatId, { messages, title });
    },
    [
      currentChatId,
      chatId,
      currentChat?.title,
      updateChat,
      generateChatTitle,
      newlyCreatedChatIdRef,
    ]
  );

  return { handleMessagesChange };
}
