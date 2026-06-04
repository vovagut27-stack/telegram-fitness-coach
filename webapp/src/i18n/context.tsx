import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getTelegramUserId } from "../services/telegram";
import {
  loadStoredLocale,
  saveStoredLocale,
  t,
  type Locale,
  type MessageKey,
} from "./index";
import { getApiBase } from "../config";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  applyLocaleFromProfile: (language?: string) => void;
  tr: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function parseLocale(raw: string | undefined): Locale | null {
  return raw === "en" || raw === "ru" ? raw : null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadStoredLocale);

  const applyLocaleFromProfile = useCallback((language: string | undefined) => {
    const next = parseLocale(language);
    if (next) {
      setLocaleState(next);
      saveStoredLocale(next);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    saveStoredLocale(next);
    const telegramId = getTelegramUserId();
    if (!telegramId) {
      return;
    }
    void fetch(`${getApiBase()}/user/language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId, language: next }),
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      applyLocaleFromProfile,
      tr: (key, vars) => t(locale, key, vars),
    }),
    [locale, setLocale, applyLocaleFromProfile],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
