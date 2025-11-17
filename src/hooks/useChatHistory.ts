"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Chat, ChatSettings, DEFAULT_SETTINGS } from "@/types/chat";

const MAX_CHATS = 50;

export function useChatHistory() {
  const [chats, setChats, chatsHydrated] = useLocalStorage<Chat[]>(
    "chat-history",
    []
  );
  const [currentChatId, setCurrentChatId, currentChatIdHydrated] =
    useLocalStorage<string | null>("current-chat-id", null);

  const createChat = useCallback(
    (
      title: string = "New Chat",
      settings: ChatSettings = DEFAULT_SETTINGS
    ): Chat => {
      const newChat: Chat = {
        id: crypto.randomUUID(),
        title,
        messages: [],
        settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setChats((prev) => {
        const updated = [newChat, ...prev];
        return updated.slice(0, MAX_CHATS);
      });

      setCurrentChatId(newChat.id);
      return newChat;
    },
    [setChats, setCurrentChatId]
  );

  const updateChat = useCallback(
    (chatId: string, updates: Partial<Chat>) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, ...updates, updatedAt: Date.now() }
            : chat
        )
      );
    },
    [setChats]
  );

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      if (currentChatId === chatId) {
        const remainingChats = chats.filter((chat) => chat.id !== chatId);
        setCurrentChatId(
          remainingChats.length > 0 ? remainingChats[0].id : null
        );
      }
    },
    [chats, currentChatId, setChats, setCurrentChatId]
  );

  const selectChat = useCallback(
    (chatId: string) => {
      setCurrentChatId(chatId);
    },
    [setCurrentChatId]
  );

  const generateChatTitle = useCallback((firstMessage: string): string => {
    const words = firstMessage.split(" ").slice(0, 6);
    return words.join(" ") + (firstMessage.split(" ").length > 6 ? "..." : "");
  }, []);

  // Use useMemo to prevent creating new object reference on every render
  const currentChat = useMemo(() => {
    return chats.find((chat) => chat.id === currentChatId) || null;
  }, [chats, currentChatId]);

  return {
    chats,
    currentChatId,
    currentChat,
    createChat,
    updateChat,
    deleteChat,
    selectChat,
    generateChatTitle,
    isHydrated: chatsHydrated && currentChatIdHydrated,
  };
}
