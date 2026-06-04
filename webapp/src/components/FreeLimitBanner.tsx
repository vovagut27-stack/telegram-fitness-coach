import type { ReactElement } from "react";
import type { UserProfile } from "../types";
import { useI18n } from "../i18n/context";

interface FreeLimitBannerProps {
  profile: UserProfile;
  onUpgrade: () => void;
}

export function FreeLimitBanner({ profile, onUpgrade }: FreeLimitBannerProps): ReactElement | null {
  const { tr } = useI18n();

  if (profile.isPremium) {
    return null;
  }

  const limit = profile.freeWeeklyLimit ?? 3;
  const used = profile.completedWorkoutsThisWeek ?? 0;
  const remaining = profile.freeWorkoutsRemaining ?? Math.max(0, limit - used);
  const exhausted = profile.canStartNewWorkout === false || remaining <= 0;

  return (
    <section className={`card free-limit-banner${exhausted ? " exhausted" : ""}`}>
      <p className="free-limit-title">
        {exhausted ? tr("free_limit_title_done") : tr("free_limit_title")}
      </p>
      <p className="muted">
        {tr("free_limit_progress", {
          used: String(used),
          limit: String(limit),
        })}
      </p>
      {exhausted ? (
        <>
          <p className="muted small">{tr("free_limit_hint")}</p>
          <button type="button" className="btn-primary" onClick={onUpgrade}>
            {tr("home_premium")}
          </button>
        </>
      ) : (
        <p className="muted small">
          {tr("free_limit_remaining", { n: String(remaining) })}
        </p>
      )}
    </section>
  );
}
