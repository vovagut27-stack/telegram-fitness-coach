import type { Locale } from "./index";

const labels: Record<Locale, Record<string, string>> = {
  ru: {
    beginner: "Новичок",
    intermediate: "Средний",
    advanced: "Продвинутый",
  },
  en: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  },
};

export function levelLabel(locale: Locale, level: string): string {
  return labels[locale][level] ?? level;
}
