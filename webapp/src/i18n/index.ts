import { en } from "./en";
import { ru } from "./ru";

export type Locale = "ru" | "en";
export type MessageKey = keyof typeof en;

const catalogs = { en, ru };

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const catalog = catalogs[locale] ?? catalogs.ru;
  let message: string = catalog[key] ?? catalogs.en[key] ?? String(key);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      message = message.replaceAll(`{${name}}`, String(value));
    }
  }
  return message;
}

const STORAGE_KEY = "fitbot_locale";

export function loadStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "en" ? "en" : "ru";
  } catch {
    return "ru";
  }
}

export function saveStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Telegram WebView may block storage — ignore
  }
}
