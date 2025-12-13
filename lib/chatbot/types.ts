export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  message: string;
  context?: {
    path?: string;
    productSlug?: string;
  };
};

export type ChatResponse = {
  reply: string;
};

export interface ChatbotProvider {
  providerName: string;
  reply(input: {
    message: string;
    context?: ChatRequest["context"];
    products?: Array<{ name: string; slug: string; short_benefit: string | null }>;
  }): Promise<string>;
}


