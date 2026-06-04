import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useI18n } from "../i18n/context";
import { fetchPersonalRecords, type PersonalRecord } from "../services/api";
import { requireTelegramUserId } from "../services/telegram";

export function PersonalRecords(): ReactElement {
  const { tr } = useI18n();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPersonalRecords(requireTelegramUserId());
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="muted">{tr("loading")}</p>;
  }
  if (records.length === 0) {
    return <p className="muted">{tr("pr_empty")}</p>;
  }

  return (
    <ul className="pr-list">
      {records.map((r) => (
        <li key={r.exerciseName} className="pr-row">
          <strong>{r.exerciseName}</strong>
          <span className="muted">
            {r.bestWeightKg != null
              ? `${r.bestWeightKg} ${tr("kg_unit")}`
              : r.bestReps != null
                ? `${r.bestReps} ${tr("pr_reps")}`
                : r.bestVolumeKg > 0
                  ? `${r.bestVolumeKg} ${tr("kg_unit")} ${tr("pr_volume")}`
                  : "—"}
            {" · "}
            {r.achievedDate.slice(5)}
          </span>
        </li>
      ))}
    </ul>
  );
}
