import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useI18n } from "../i18n/context";
import { fetchPremiumInsights, type PremiumInsights } from "../services/api";
import { requireTelegramUserId } from "../services/telegram";

export function PremiumInsightsCard(): ReactElement {
  const { tr } = useI18n();
  const [data, setData] = useState<PremiumInsights | null>(null);

  const load = useCallback(async () => {
    try {
      const insights = await fetchPremiumInsights(requireTelegramUserId());
      setData(insights);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) {
    return (
      <section className="card inset premium-insights">
        <p className="muted">{tr("insights_loading")}</p>
      </section>
    );
  }

  const volTrend =
    data.volumeChangePercent == null
      ? "—"
      : data.volumeChangePercent > 0
        ? `+${data.volumeChangePercent}%`
        : `${data.volumeChangePercent}%`;

  const maxVol = Math.max(...data.weeklyVolume.map((w) => w.totalVolumeKg), 1);

  return (
    <section className="card premium-insights">
      <h3>📈 {tr("insights_title")}</h3>
      <div className="stats-grid">
        <article className="stat-pill">
          <strong>{data.volumeThisWeekKg}</strong>
          <span className="muted">{tr("insights_volume_week")}</span>
          <span className="muted small">
            {tr("insights_vs_last", { pct: volTrend })}
          </span>
        </article>
        <article className="stat-pill">
          <strong>{data.personalRecordsCount}</strong>
          <span className="muted">{tr("insights_pr_count")}</span>
        </article>
        <article className="stat-pill">
          <strong>{data.topFocus ?? "—"}</strong>
          <span className="muted">{tr("insights_top_focus")}</span>
        </article>
      </div>
      <div className="volume-bars" aria-hidden>
        {data.weeklyVolume.map((w) => (
          <div key={w.weekStart} className="volume-bar-col" title={w.weekStart}>
            <div
              className="volume-bar-fill"
              style={{
                height: `${Math.max(8, (w.totalVolumeKg / maxVol) * 100)}%`,
              }}
            />
            <span className="volume-bar-label">{w.workoutsCompleted}</span>
          </div>
        ))}
      </div>
      <p className="muted small">{tr("insights_chart_hint")}</p>
    </section>
  );
}
