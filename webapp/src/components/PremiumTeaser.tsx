import type { ReactElement } from "react";
import { useI18n } from "../i18n/context";

interface PremiumTeaserProps {
  titleKey: "pr_teaser_title" | "insights_teaser_title" | "share_teaser_title";
  onUpgrade: () => void;
}

export function PremiumTeaser({ titleKey, onUpgrade }: PremiumTeaserProps): ReactElement {
  const { tr } = useI18n();
  return (
    <section className="card premium-teaser">
      <h3>⭐ {tr(titleKey)}</h3>
      <p className="muted">{tr("premium_teaser_sub")}</p>
      <button type="button" className="btn-gold" onClick={onUpgrade}>
        {tr("home_premium")}
      </button>
    </section>
  );
}
