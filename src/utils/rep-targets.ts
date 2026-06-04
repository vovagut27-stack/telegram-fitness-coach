/** Разбивает строку повторов на целевые значения по подходам. */
export function repTargetsPerSet(reps: string, sets: number): number[] {
  const count = Math.max(1, Math.floor(sets));
  const trimmed = reps.trim().toLowerCase();

  const plus = trimmed.match(/^(\d+)\+$/);
  if (plus) {
    const n = Number(plus[1]);
    return Array.from({ length: count }, () => n);
  }

  const range = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (range) {
    const low = Number(range[1]);
    const high = Number(range[2]);
    if (count === 1) {
      return [high];
    }
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      return Math.round(low + (high - low) * t);
    });
  }

  const single = Number(trimmed.replace(/[^\d]/g, "") || trimmed);
  if (Number.isFinite(single) && single > 0) {
    return Array.from({ length: count }, () => single);
  }

  return Array.from({ length: count }, () => 10);
}
