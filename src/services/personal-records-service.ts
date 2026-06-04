import { getWorkoutResultsHistory, type ExerciseLogRow } from "../database/workouts-repo.js";

export interface PersonalRecord {
  exerciseName: string;
  bestWeightKg: number | null;
  bestReps: number | null;
  bestVolumeKg: number;
  achievedDate: string;
}

function bestRepsFromLog(log: ExerciseLogRow): number {
  if (!log.repsCompleted.length) {
    return 0;
  }
  return Math.max(...log.repsCompleted);
}

function volumeKg(log: ExerciseLogRow): number {
  const weight = log.weightUsed ?? 0;
  if (weight > 0) {
    const repsSum = log.repsCompleted.reduce((a, b) => a + b, 0);
    return Math.round(weight * repsSum * 10) / 10;
  }
  return 0;
}

export async function getPersonalRecords(
  telegramId: number,
  limit = 12,
): Promise<PersonalRecord[]> {
  const history = await getWorkoutResultsHistory(telegramId, 120);
  const map = new Map<string, PersonalRecord>();

  for (const day of history) {
    for (const log of day.exercises) {
      const name = log.exerciseName.trim();
      if (!name) {
        continue;
      }
      const reps = bestRepsFromLog(log);
      const vol = volumeKg(log);
      const cur = map.get(name) ?? {
        exerciseName: name,
        bestWeightKg: null,
        bestReps: null,
        bestVolumeKg: 0,
        achievedDate: day.workoutDate,
      };

      if (log.weightUsed != null && (cur.bestWeightKg == null || log.weightUsed > cur.bestWeightKg)) {
        cur.bestWeightKg = log.weightUsed;
        cur.achievedDate = day.workoutDate;
      }
      if (reps > 0 && (cur.bestReps == null || reps > cur.bestReps)) {
        if (log.weightUsed == null || log.weightUsed === 0) {
          cur.bestReps = reps;
          cur.achievedDate = day.workoutDate;
        } else if (cur.bestReps == null || reps > cur.bestReps) {
          cur.bestReps = reps;
        }
      }
      if (vol > cur.bestVolumeKg) {
        cur.bestVolumeKg = vol;
        cur.achievedDate = day.workoutDate;
      }

      map.set(name, cur);
    }
  }

  return [...map.values()]
    .filter((r) => r.bestWeightKg != null || r.bestReps != null || r.bestVolumeKg > 0)
    .sort((a, b) => b.bestVolumeKg - a.bestVolumeKg || b.bestWeightKg! - (a.bestWeightKg ?? 0))
    .slice(0, limit);
}
