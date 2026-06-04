import { useState } from "react";
import type { ReactElement } from "react";
import type { UserProfile } from "../types";
import { useI18n } from "../i18n/context";
import { fetchPremiumInvoiceLink, fetchProfile } from "../services/api";
import { getTelegramUserId, openStarsInvoice, requireTelegramUserId } from "../services/telegram";

const FEATURE_KEYS = [
  "premium_f_unlimited",
  "premium_f_gym",
  "premium_f_schedule",
  "premium_f_history",
  "premium_f_insights",
  "premium_f_pr",
  "premium_f_rest",
  "premium_f_export",
  "premium_f_reminders",
] as const;

interface PremiumPanelProps {
  profile: UserProfile;
  onPaid: () => void;
}

async function refreshPremiumStatus(): Promise<UserProfile | null> {
  const id = getTelegramUserId();
  if (!id) {
    return null;
  }
  for (let i = 0; i < 5; i++) {
    const p = await fetchProfile(id);
    if (p.isPremium) {
      return p;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  return fetchProfile(id);
}

export function PremiumPanel({ profile, onPaid }: PremiumPanelProps): ReactElement {
  const { tr, locale } = useI18n();
  const [loading, setLoading] = useState(false);

  if (profile.isPremium) {
    return (
      <section className="card premium active">
        <h2>⭐ {tr("premium_active")}</h2>
        {profile.premiumUntil ? (
          <p>{tr("premium_until", { date: new Date(profile.premiumUntil).toLocaleDateString() })}</p>
        ) : null}
        <ul className="premium-features-list">
          {FEATURE_KEYS.map((key) => (
            <li key={key}>✓ {tr(key)}</li>
          ))}
        </ul>
      </section>
    );
  }

  const buy = async (): Promise<void> => {
    setLoading(true);
    try {
      const telegramId = requireTelegramUserId();
      const url = await fetchPremiumInvoiceLink(telegramId, locale);
      openStarsInvoice(url, (paid) => {
        if (paid) {
          void refreshPremiumStatus().then(() => onPaid());
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card premium">
      <h2>⭐ {tr("premium_title")}</h2>
      <p className="muted">{tr("premium_sub")}</p>
      <ul className="premium-features-list gold">
        {FEATURE_KEYS.map((key) => (
          <li key={key}>{tr(key)}</li>
        ))}
      </ul>
      <button type="button" className="btn-gold" disabled={loading} onClick={() => void buy()}>
        {loading ? tr("loading") : tr("premium_cta")}
      </button>
      <p className="muted small">{tr("premium_dev_hint")}</p>
    </section>
  );
}
