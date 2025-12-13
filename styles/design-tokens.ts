export const designTokens = {
  colors: {
    bg: {
      base: "hsl(40 33% 97%)",
      surface: "hsl(0 0% 100%)",
      muted: "hsl(40 22% 94%)",
    },
    text: {
      primary: "hsl(222 20% 16%)",
      muted: "hsl(222 10% 40%)",
      subtle: "hsl(222 8% 55%)",
      inverse: "hsl(0 0% 100%)",
    },
    border: "hsl(40 16% 86%)",
    accent: {
      primary: "hsl(158 35% 42%)",
      soft: "hsl(158 30% 92%)",
      warn: "hsl(28 80% 55%)",
      danger: "hsl(0 70% 52%)",
    },
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.04)",
    md: "0 6px 18px rgba(0,0,0,0.06)",
  },
  spacing: {
    pageX: "clamp(16px, 4vw, 32px)",
    sectionY: "clamp(40px, 7vw, 88px)",
  },
  typography: {
    fontSans: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
  },
} as const;

export type DesignTokens = typeof designTokens;


