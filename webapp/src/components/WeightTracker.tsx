import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useI18n } from "../i18n/context";
import {
  fetchWeightHistory,
  logUserWeight,
  type WeightHistoryResponse,
} from "../services/api";
import { requireTelegramUserId } from "../services/telegram";

export function WeightTracker(): ReactElement {
  const { tr } = useI18n();
  const [data, setData] = useState<WeightHistoryResponse | null>(null);
  const [weight, setWeight] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const history = await fetchWeightHistory(requireTelegramUserId());
    setData(history);
    if (history.comparison.latestWeight != null) {
      setWeight((prev) => prev || String(history.comparison.latestWeight));
    }
  }, []);

  useEffect(() => {
    void reload().catch(() => undefined);
  }, [reload]);

  const trendText = (): string => {
    const c = data?.comparison;
    if (!c?.weightTrend) {
      return tr("weight_trend_none");
    }
    if (c.weightTrend === "down") {
      return tr("weight_trend_down", { kg: String(c.weightChangeKg ?? 0) });
    }
    if (c.weightTrend === "up") {
      return tr("weight_trend_up", { kg: String(c.weightChangeKg ?? 0) });
    }
    return tr("weight_trend_stable");
  };

  const submit = async (): Promise<void> => {
    const kg = Number(weight);
    if (!kg || kg < 30) {
      setMsg(tr("weight_invalid"));
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await logUserWeight(requireTelegramUserId(), kg, logDate);
      await reload();
      setMsg(tr("saved"));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : tr("load_error"));
    } finally {
      setSaving(false);
    }
  };

  const entries = [...(data?.entries ?? [])].sort((a, b) =>
    b.logDate.localeCompare(a.logDate),
  );
  const minW = entries.length
    ? Math.min(...entries.map((e) => e.weightKg))
    : null;
  const maxW = entries.length
    ? Math.max(...entries.map((e) => e.weightKg))
    : null;

  return (
    <section className="weight-tracker card inset">
      <h3>{tr("weight_tracker_title")}</h3>
      <p className="muted">{trendText()}</p>
      {data?.comparison.firstWeight != null && data.comparison.latestWeight != null ? (
        <p className="muted small">
          {tr("weight_range", {
            from: String(data.comparison.firstWeight),
            to: String(data.comparison.latestWeight),
          })}
        </p>
      ) : null}

      <div className="row-2">
        <label className="field">
          {tr("weight_log_date")}
          <input
            type="date"
            value={logDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setLogDate(e.target.value)}
          />
        </label>
        <label className="field">
          {tr("weight")} *
          <input
            type="number"
            min={35}
            max={250}
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
      </div>
      <button type="button" className="btn-secondary" disabled={saving} onClick={() => void submit()}>
        {saving ? tr("loading") : tr("weight_log_btn")}
      </button>
      {msg ? <p className="ok">{msg}</p> : null}

      {entries.length > 0 ? (
        <ul className="weight-chart">
          {entries.slice(0, 14).map((e) => {
            const span = maxW != null && minW != null && maxW > minW ? maxW - minW : 1;
            const pct = minW != null && maxW != null ? ((e.weightKg - minW) / span) * 100 : 50;
            return (
              <li key={e.id} className="weight-bar-row">
                <span className="weight-date">{e.logDate.slice(5)}</span>
                <div className="weight-bar-track">
                  <div className="weight-bar-fill" style={{ width: `${Math.max(8, pct)}%` }} />
                </div>
                <span className="weight-val">
                  {e.weightKg} {tr("kg_unit")}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="muted">{tr("weight_empty")}</p>
      )}
    </section>
  );
}
