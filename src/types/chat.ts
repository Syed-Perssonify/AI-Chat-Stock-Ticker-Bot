export interface StreamData {
  thinking?: string[];
  toolCalls?: Array<{ tool: string; input: string; timestamp: number }>;
  toolResults?: Array<{ tool: string; output: string; timestamp: number }>;
  start?: { query?: string; timestamp?: string };
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  streamData?: StreamData;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  settings: ChatSettings;
  createdAt: number;
  updatedAt: number;
}

export interface ChatSettings {
  startDate: Date | null;
  endDate: Date | null;
  stockTicker: string;
  formTypes: string;
  deepAnalysis: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  startDate: null,
  endDate: null,
  stockTicker: "",
  formTypes: "",
  deepAnalysis: false,
};
