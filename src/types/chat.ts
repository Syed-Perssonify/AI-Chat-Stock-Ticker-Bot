export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
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
  temperature: number;
  startDate: Date | null;
  endDate: Date | null;
  stockTicker: string;
  formTypes: string;
}

export type PresetType = "precise" | "balanced" | "creative";

export const DEFAULT_SETTINGS: ChatSettings = {
  temperature: 0.7,
  startDate: null,
  endDate: null,
  stockTicker: "",
  formTypes: "",
};

export const FORM_OPTIONS = [
  { value: "general", label: "General" },
  { value: "technical", label: "Technical" },
  { value: "creative", label: "Creative" },
  { value: "business", label: "Business" },
  { value: "academic", label: "Academic" },
] as const;

export const PRESET_SETTINGS = {
  precise: {
    temperature: 0.3,
    topP: 0.5,
    maxTokens: 2048,
    description: "Focused and deterministic responses",
  },
  balanced: {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    description: "Good balance between creativity and consistency",
  },
  creative: {
    temperature: 1.2,
    topP: 0.95,
    maxTokens: 2048,
    description: "More creative and varied responses",
  },
} as const;
