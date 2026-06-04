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
      name: "Птица-собака",
      sets: 3,
      reps: "10",
      restSeconds: 45,
      instructions: "На четвереньках, противоположная рука и нога, корпус стабилен.",
      equipment: "none",
    },
    {
      name: "Bird-dog",
      sets: 3,
      reps: "10",
      restSeconds: 45,
      instructions: "On all fours, opposite arm and leg, stable torso.",
      equipment: "none",
    },
  ),
  ex(
    {
      name: "Австралийские подтягивания под столом",
      sets: 3,
      reps: "8-10",
      restSeconds: 60,
      instructions: "Корпус прямой, грудь к краю стола, лопатки сведены.",
      equipment: "none",
    },
    {
      name: "Inverted table rows",
      sets: 3,
      reps: "8-10",
      restSeconds: 60,
      instructions: "Body straight, chest to table edge, squeeze shoulder blades.",
      equipment: "none",
    },
  ),
  ex(
    {
      name: "Тяга полотенца к поясу",
      sets: 3,
      reps: "12",
      restSeconds: 55,
      instructions: "Полотенце в дверном проёме, локти вдоль корпуса.",
      equipment: "none",
    },
    {
      name: "Towel door rows",
      sets: 3,
      reps: "12",
      restSeconds: 55,
      instructions: "Towel in doorway, elbows close to ribs.",
      equipment: "none",
    },
  ),
  ex(
    {
      name: "Тяга в наклоне с рюкзаком",
      sets: 3,
      reps: "10",
      restSeconds: 60,
      instructions: "Спина параллельно полу, тяните рюкзак к поясу.",
      equipment: "none",
    },
    {
      name: "Backpack bent-over rows",
      sets: 3,
      reps: "10",
      restSeconds: 60,
      instructions: "Flat back, pull backpack to hip.",
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
  ex(
    {
      name: "Сгибание рук с полотенцем",
      sets: 3,
      reps: "12",
      restSeconds: 50,
      instructions: "Стоя на полотенце, сгибание с сопротивлением ног.",
      equipment: "none",
    },
    {
      name: "Towel biceps curls",
      sets: 3,
      reps: "12",
      restSeconds: 50,
      instructions: "Stand on towel, curl against foot resistance.",
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
      name: "Тяга верхнего блока",
      sets: 3,
      reps: "10-12",
      restSeconds: 75,
      instructions: "Тяните локтями вниз, сведите лопатки.",
      equipment: "cable",
    },
    {
      name: "Lat pulldown",
      sets: 3,
      reps: "10-12",
      restSeconds: 75,
      instructions: "Drive elbows down, squeeze shoulder blades.",
      equipment: "cable",
    },
  ),
  ex(
    {
      name: "Тяга гантели в наклоне",
      sets: 3,
      reps: "10",
      restSeconds: 75,
      instructions: "Спина параллельно полу, локоть к поясу.",
      equipment: "dumbbell",
    },
    {
      name: "Single-arm dumbbell row",
      sets: 3,
      reps: "10",
      restSeconds: 75,
      instructions: "Flat back, pull to hip.",
      equipment: "dumbbell",
    },
  ),
  ex(
    {
      name: "Тяга горизонтальная",
      sets: 3,
      reps: "10-12",
      restSeconds: 75,
      instructions: "Сведите лопатки в конце движения.",
      equipment: "cable",
    },
    {
      name: "Seated cable row",
      sets: 3,
      reps: "10-12",
      restSeconds: 75,
      instructions: "Squeeze shoulder blades at the finish.",
      equipment: "cable",
    },
  ),
  ex(
    {
      name: "Сгибание штанги",
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      instructions: "Локти прижаты, без раскачки корпуса.",
      equipment: "barbell",
    },
    {
      name: "Barbell curl",
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      instructions: "Elbows fixed, strict form.",
      equipment: "barbell",
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
