export const HOME = "/";
export const NEW_CHAT = "/new";
export const CHAT = "/chat";

export const getChatRoute = (chatId: string): string => `${CHAT}/${chatId}`;
