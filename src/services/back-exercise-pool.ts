import type { WorkoutExercise } from "../types/workout.js";
import type { LocalizedExercise } from "./home-ready-splits.js";

function ex(
  ru: Omit<WorkoutExercise, "name"> & { name: string },
  en: Omit<WorkoutExercise, "name"> & { name: string },
): LocalizedExercise {
  return { ru, en };
}

/** Дополнительный пул для дня «Спина и бицепс» (дом). */
export const HOME_BACK_POOL: LocalizedExercise[] = [
  ex(
    {
      name: "Супермен",
      sets: 3,
      reps: "12",
      restSeconds: 50,
      instructions: "Лёжа на животе, подъём рук и ног, задержка 1 сек вверху.",
      equipment: "none",
    },
    {
      name: "Superman hold",
      sets: 3,
      reps: "12",
      restSeconds: 50,
      instructions: "Prone, lift arms and legs, 1s hold at top.",
      equipment: "none",
    },
  ),
  ex(
    {
      name: "Обратная планка",
      sets: 3,
      reps: "30 сек",
      restSeconds: 45,
      instructions: "Ладони назад, корпус в линию, не провисайте в пояснице.",
      equipment: "none",
    },
    {
      name: "Reverse plank",
      sets: 3,
      reps: "30 сек",
      restSeconds: 45,
      instructions: "Hands behind you, body in a straight line.",
      equipment: "none",
    },
  ),
];

/** Дополнительный пул для спины в зале. */
export const GYM_BACK_POOL: LocalizedExercise[] = [
  ex(
    {
      name: "Подтягивания",
      sets: 3,
      reps: "6-10",
      restSeconds: 90,
      instructions: "Хват чуть шире плеч, грудь к перекладине.",
      equipment: "machine",
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: "6-10",
      restSeconds: 90,
      instructions: "Overhand grip, chest toward the bar.",
      equipment: "machine",
    },
  ),
  ex(
    {
      name: "Молотковые сгибания",
      sets: 3,
      reps: "12",
      restSeconds: 55,
      instructions: "Нейтральный хват, контроль негативной фазы.",
      equipment: "dumbbell",
    },
    {
      name: "Hammer curls",
      sets: 3,
      reps: "12",
      restSeconds: 55,
      instructions: "Neutral grip, controlled eccentric.",
      equipment: "dumbbell",
    },
  ),
];
