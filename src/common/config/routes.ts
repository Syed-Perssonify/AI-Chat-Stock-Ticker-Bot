export const routes = {
  HOME: "/",
  NEW_CHAT: "/chat/new",
  CHAT: "/chat",
} as const;

export const getChatRoute = (chatId: string) => `${routes.CHAT}/${chatId}`;
