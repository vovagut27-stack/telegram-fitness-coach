import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getTelegramUserId } from "../services/telegram";
import { API_BASE } from "../config";
import {
  loadStoredLocale,
  saveStoredLocale,
  t,
  type Locale,
  type MessageKey,
} from "./index";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadStoredLocale);

  useEffect(() => {
    const telegramId = getTelegramUserId();
    fetch(`${API_BASE}/user/settings?telegramId=${telegramId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { language?: string } | null) => {
        if (data?.language === "en" || data?.language === "ru") {
          setLocaleState(data.language);
          saveStoredLocale(data.language);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    saveStoredLocale(next);
    const telegramId = getTelegramUserId();
    void fetch(`${API_BASE}/user/language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId, language: next }),
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      tr: (key, vars) => t(locale, key, vars),
    }),
    [locale, setLocale],
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
