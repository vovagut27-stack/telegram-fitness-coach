import type { FitnessLevel } from "../types/workout.js";
import type { Locale } from "../types/locale.js";
import { en } from "./en.js";
import { ru } from "./ru.js";

export type MessageKey = keyof typeof en;

const catalogs = { en, ru };

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const catalog = catalogs[locale] ?? catalogs.en;
  let message: string = catalog[key] ?? catalogs.en[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      message = message.replaceAll(`{${name}}`, String(value));
    }
  }
  return message;
}

const LEVEL_LABELS: Record<Locale, Record<FitnessLevel, string>> = {
  ru: { beginner: "Новичок", intermediate: "Средний", advanced: "Продвинутый" },
  en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
};

export function levelLabel(locale: Locale, level: FitnessLevel): string {
  return LEVEL_LABELS[locale]?.[level] ?? LEVEL_LABELS.en[level];
}
