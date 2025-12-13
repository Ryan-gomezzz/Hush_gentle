import type { ChatbotProvider } from "@/lib/chatbot/types";
import { StubChatbotProvider } from "@/lib/chatbot/providers/stub";

export function getChatbotProvider(): ChatbotProvider {
  const provider = (process.env.CHATBOT_PROVIDER ?? "stub").toLowerCase();
  switch (provider) {
    case "stub":
    default:
      return new StubChatbotProvider();
  }
}


