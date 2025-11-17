import { useEffect, useRef, useCallback } from "react";
import { Message, ChatSettings, DEFAULT_SETTINGS } from "@/types/chat";

interface UseChatMessagesProps {
  chatId: string | undefined;
  currentChatId: string | null;
  currentChat: any;
  isNewChatRoute: boolean;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setSettings: (
    settings: ChatSettings | ((prev: ChatSettings) => ChatSettings)
  ) => void;
  newlyCreatedChatIdRef: React.MutableRefObject<string | undefined>;
  currentMessagesLength?: number;
}

export function useChatMessages({
  chatId,
  currentChatId,
  currentChat,
  isNewChatRoute,
  setMessages,
  setSettings,
  newlyCreatedChatIdRef,
  currentMessagesLength = 0,
}: UseChatMessagesProps) {
  const prevChatIdRef = useRef<string | undefined>(undefined);
  const prevMessagesRef = useRef<Message[] | null>(null);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Skip on initial mount to avoid clearing messages unnecessarily
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (currentChat && chatId === currentChatId) {
        setMessages(currentChat.messages);
        setSettings(currentChat.settings);
        prevChatIdRef.current = chatId;
        prevMessagesRef.current = currentChat.messages;
      }
      return;
    }

    if (isNewChatRoute) {
      // Only clear if we're actually on new route and chatId changed
      // Don't clear if we just created a new chat (newlyCreatedChatIdRef has a value)
      if (
        prevChatIdRef.current !== undefined &&
        !newlyCreatedChatIdRef.current
      ) {
        setMessages([]);
        setSettings(DEFAULT_SETTINGS);
        prevChatIdRef.current = undefined;
        prevMessagesRef.current = null;
      }
    } else if (currentChat && chatId === currentChatId) {
      // Load messages when we have a chat and chatId matches
      // Only update if chatId changed or messages reference changed
      const chatIdChanged = prevChatIdRef.current !== chatId;
      const messagesChanged = prevMessagesRef.current !== currentChat.messages;

      if (chatIdChanged || messagesChanged) {
        // Only update if the chat has messages OR if chatId changed
        // Don't overwrite if local messages are ahead (we're actively adding messages)
        const chatMessagesLength = currentChat.messages?.length || 0;
        const localMessagesAhead = currentMessagesLength > chatMessagesLength;

        if (chatIdChanged || (chatMessagesLength > 0 && !localMessagesAhead)) {
          console.log("useChatMessages: Updating messages from chat", {
            chatId,
            chatIdChanged,
            messagesChanged,
            chatMessagesLength,
            currentMessagesLength,
            localMessagesAhead,
          });
          setMessages(currentChat.messages);
          setSettings(currentChat.settings);
          prevChatIdRef.current = chatId;
          prevMessagesRef.current = currentChat.messages;
        } else {
          console.log(
            "useChatMessages: Skipping update - local messages ahead or chat empty",
            {
              chatMessagesLength,
              currentMessagesLength,
              localMessagesAhead,
            }
          );
        }
      }
    } else if (
      chatId &&
      chatId === currentChatId &&
      !currentChat &&
      prevChatIdRef.current !== chatId
    ) {
      // Chat is selected but not loaded yet - clear messages to avoid showing wrong chat
      setMessages([]);
      prevChatIdRef.current = chatId;
      prevMessagesRef.current = null;
    }
  }, [
    chatId,
    currentChatId,
    currentChat,
    isNewChatRoute,
    setMessages,
    setSettings,
  ]);
}
