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

export function levelLabel(locale: Locale, level: FitnessLevel): string {
  const key = `level_${level}` as MessageKey;
  return t(locale, key);
}
