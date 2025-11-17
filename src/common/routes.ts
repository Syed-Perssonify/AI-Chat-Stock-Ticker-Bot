export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  NEW_CHAT: "/chat/new",
  CHAT: "/chat",
} as const;

export const getChatRoute = (chatId: string) => `${ROUTES.CHAT}/${chatId}`;
