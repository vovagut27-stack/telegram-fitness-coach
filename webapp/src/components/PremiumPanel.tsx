import { useState } from "react";
import type { ReactElement } from "react";
import type { UserProfile } from "../types";
import { useI18n } from "../i18n/context";
import { fetchPremiumInvoiceLink } from "../services/api";
import { getTelegramUserId, openStarsInvoice } from "../services/telegram";

interface PremiumPanelProps {
  profile: UserProfile;
  onPaid: () => void;
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
      </section>
    );
  }

  const buy = async (): Promise<void> => {
    setLoading(true);
    try {
      const url = await fetchPremiumInvoiceLink(getTelegramUserId(), locale);
      openStarsInvoice(url, (paid) => {
        if (paid) {
          onPaid();
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
    </section>
  );
}
