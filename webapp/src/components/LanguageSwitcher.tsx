import type { ReactElement } from "react";
import { useI18n } from "../i18n/context";
import type { Locale } from "../i18n";

export function LanguageSwitcher(): ReactElement {
  const { locale, setLocale, tr } = useI18n();

  return (
    <div className="lang-switcher">
      <span>{tr("lang_label")}:</span>
      {(["ru", "en"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          className={locale === code ? "lang-btn active" : "lang-btn"}
          onClick={() => setLocale(code)}
        >
          {tr(code === "ru" ? "lang_ru" : "lang_en")}
        </button>
      ))}
    </div>
  );
}
