import { useState } from "react";
import type { ReactElement } from "react";
import type { UserProfile } from "../types";
import { useI18n } from "../i18n/context";
import { fetchPremiumInvoiceLink, fetchProfile } from "../services/api";
import { getTelegramUserId, openStarsInvoice, requireTelegramUserId } from "../services/telegram";

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
        <p className="muted">{tr("premium_gym_hint")}</p>
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
      <p>{tr("premium_bullets")}</p>
      <button type="button" className="btn-gold" disabled={loading} onClick={() => void buy()}>
        {loading ? tr("loading") : tr("premium_cta")}
      </button>
      <p className="muted">{tr("premium_dev_hint")}</p>
    </section>
  );
}
