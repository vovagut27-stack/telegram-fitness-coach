export type Locale = "ru" | "en";

export const DEFAULT_LOCALE: Locale = "ru";

export function parseLocale(value: unknown): Locale {
  return value === "en" ? "en" : "ru";
}
