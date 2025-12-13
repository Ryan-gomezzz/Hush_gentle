import type { ChatbotProvider } from "@/lib/chatbot/types";

function includesAny(haystack: string, needles: string[]) {
  return needles.some((n) => haystack.includes(n));
}

export class StubChatbotProvider implements ChatbotProvider {
  providerName = "stub";

  async reply(input: {
    message: string;
    products?: Array<{ name: string; slug: string; short_benefit: string | null }>;
  }): Promise<string> {
    const msg = input.message.toLowerCase();

    if (includesAny(msg, ["cracked heel", "cracked heels", "heel", "feet", "foot"])) {
      return (
        "For cracked heels or very dry feet, a richer foot-repair style balm is usually the most comforting. " +
        "If you want something gentle for a nightly routine, look for a foot balm or foot butter and apply it before bed (cotton socks help). " +
        "If you’re unsure, tell me how dry your feet feel (mild / moderate / very dry) and I’ll suggest a simple pick."
      );
    }

    if (includesAny(msg, ["sensitive", "irritat", "allergy", "rash"])) {
      return (
        "If your skin is sensitive, the calm approach is to choose minimal formulas and patch-test first. " +
        "Hush Gentle products are designed to be skin-respecting (no harsh chemicals, everyday-friendly). " +
        "If you share what you’re reacting to (dryness, deodorant irritation, fragrance sensitivity), I can guide you to the gentlest option."
      );
    }

    if (includesAny(msg, ["organic", "cruelty", "chemical", "chemicals", "ingredients"])) {
      return (
        "We keep ingredients simple and transparent: organic butters, cold-pressed oils, vitamin E, and gentle essential oils. " +
        "No harsh chemicals, and cruelty-free. If you tell me which product you’re looking at, I can explain the ingredients in plain language."
      );
    }

    if (includesAny(msg, ["deodorant", "underarm", "odor"])) {
      return (
        "For everyday underarm comfort, a gentle deodorant cream can be a good option—especially if you prefer a softer feel over strong fragrance. " +
        "Start with a pea-sized amount and see how your skin responds. If you have very sensitive underarms, patch-test first."
      );
    }

    const productNames = (input.products ?? []).slice(0, 4).map((p) => p.name);
    const suggestions = productNames.length
      ? `A few popular gentle picks are: ${productNames.join(", ")}.`
      : "You can share what you’re looking for (hands / feet / face / body) and I’ll suggest a gentle match.";

    return (
      "I’m here to help you choose calmly and confidently. " +
      suggestions +
      " No medical claims—just simple, practical guidance."
    );
  }
}


