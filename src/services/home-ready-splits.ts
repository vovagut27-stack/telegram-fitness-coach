import type { Locale } from "../types/locale.js";
import type { WorkoutExercise } from "../types/workout.js";
import { isoDateOnly, splitIndexForDate } from "./schedule-service.js";

export type LocalizedExercise = {
  ru: WorkoutExercise;
  en: WorkoutExercise;
};

export type HomeReadyDay = {
  dayKey: string;
  labels: { ru: string; en: string };
  focus: { ru: string[]; en: string[] };
  totalMinutes: number;
  description: { ru: string; en: string };
  exercises: LocalizedExercise[];
};

function homeEx(
  ru: Omit<WorkoutExercise, "name"> & { name: string },
  en: Omit<WorkoutExercise, "name"> & { name: string },
): LocalizedExercise {
  return { ru, en };
}

/** Готовые домашние тренировки (как в референс-приложении). */
export const HOME_READY_SPLITS: HomeReadyDay[] = [
  {
    dayKey: "home_a",
    labels: { ru: "Дом · Тренировка A", en: "Home · Workout A" },
    focus: {
      ru: ["всё тело", "кардио", "сила"],
      en: ["full body", "cardio", "strength"],
    },
    totalMinutes: 55,
    description: {
      ru: "Разминка, кардио-блок и силовые: присед у скамьи, отжимания, планка.",
      en: "Warm-up, cardio block, then strength: bench squats, push-ups, plank.",
    },
    exercises: [
      homeEx(
        {
          name: "Выпады в ходьбе",
          sets: 1,
          reps: "20",
          restSeconds: 45,
          instructions: "Шаг вперёд, корпус вертикально, смена ног в движении.",
          equipment: "none",
        },
        {
          name: "Walking lunges",
          sets: 1,
          reps: "20",
          restSeconds: 45,
          instructions: "Step forward, upright torso, alternate legs.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Круговые движения руками",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Руки в стороны, плавные круги вперёд и назад.",
          equipment: "none",
        },
        {
          name: "Arm circles",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Arms out, smooth forward and backward circles.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Прыжки с разведением рук и ног",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Мягкое приземление на носки.",
          equipment: "none",
        },
        {
          name: "Jumping jacks",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Land softly on the balls of your feet.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Бёрпи",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Присед — планка — отжимание — прыжок вверх.",
          equipment: "none",
        },
        {
          name: "Burpees",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Squat — plank — push-up — jump up.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Бег с высоким подниманием бедра",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Колено к груди, активная работа рук.",
          equipment: "none",
        },
        {
          name: "High knees",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Drive knees up, pump your arms.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Приседания у скамьи с собственным весом",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Спина к скамье/стулу, колени не выходят за носки.",
          equipment: "chair",
        },
        {
          name: "Bench bodyweight squats",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Back to bench/chair, knees track over toes.",
          equipment: "chair",
        },
      ),
      homeEx(
        {
          name: "Отжимания",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Грудь почти касается пола, корпус в линию.",
          equipment: "none",
        },
        {
          name: "Push-ups",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Chest near the floor, body in a straight line.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Приседания на корточках",
          sets: 3,
          reps: "10",
          restSeconds: 60,
          instructions: "Глубокий присед, пятки прижаты к полу если возможно.",
          equipment: "none",
        },
        {
          name: "Deep squats",
          sets: 3,
          reps: "10",
          restSeconds: 60,
          instructions: "Deep squat, heels down if mobility allows.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Алмазные отжимания",
          sets: 3,
          reps: "10",
          restSeconds: 55,
          instructions: "Руки образуют ромб под грудью, локти вдоль корпуса.",
          equipment: "none",
        },
        {
          name: "Diamond push-ups",
          sets: 3,
          reps: "10",
          restSeconds: 55,
          instructions: "Hands form a diamond under chest, elbows close.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Передняя планка",
          sets: 3,
          reps: "45 сек",
          restSeconds: 45,
          instructions: "Локти под плечами, не провисайте в пояснице.",
          equipment: "none",
        },
        {
          name: "Front plank",
          sets: 3,
          reps: "45 сек",
          restSeconds: 45,
          instructions: "Elbows under shoulders, no lower-back sag.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Растяжка сгибателей бедра стоя",
          sets: 1,
          reps: "60 сек",
          restSeconds: 0,
          instructions: "Выпад назад, таз подкручен, растяжка по 30 сек на ногу.",
          equipment: "none",
        },
        {
          name: "Standing hip flexor stretch",
          sets: 1,
          reps: "60 сек",
          restSeconds: 0,
          instructions: "Back lunge, tuck pelvis, 30 sec per side.",
          equipment: "none",
        },
      ),
    ],
  },
  {
    dayKey: "home_b",
    labels: { ru: "Дом · Тренировка B", en: "Home · Workout B" },
    focus: {
      ru: ["ноги", "ягодицы", "пресс"],
      en: ["legs", "glutes", "core"],
    },
    totalMinutes: 52,
    description: {
      ru: "Кардио-разминка, ягодичный мост на одной ноге, прыжковые приседания и планка.",
      en: "Cardio warm-up, single-leg glute bridge, jump squats and plank.",
    },
    exercises: [
      homeEx(
        {
          name: "Прыжки с разведением рук и ног",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Ровный темп, мягкая стопа.",
          equipment: "none",
        },
        {
          name: "Jumping jacks",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Steady pace, soft landing.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Бёрпи",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Контролируйте дыхание, темп умеренный.",
          equipment: "none",
        },
        {
          name: "Burpees",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Control breathing, moderate pace.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Бег с высоким подниманием бедра",
          sets: 1,
          reps: "120 сек",
          restSeconds: 45,
          instructions: "Высокий темп, корпус прямой.",
          equipment: "none",
        },
        {
          name: "High knees",
          sets: 1,
          reps: "120 сек",
          restSeconds: 45,
          instructions: "Fast pace, upright torso.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Прыжки конькобежца",
          sets: 1,
          reps: "20",
          restSeconds: 45,
          instructions: "Прыжок в сторону, приземление на согнутую ногу.",
          equipment: "none",
        },
        {
          name: "Skater jumps",
          sets: 1,
          reps: "20",
          restSeconds: 45,
          instructions: "Leap sideways, land on bent leg.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Круговые движения руками",
          sets: 1,
          reps: "60 сек",
          restSeconds: 30,
          instructions: "Плечи опущены, движение из сустава.",
          equipment: "none",
        },
        {
          name: "Arm circles",
          sets: 1,
          reps: "60 сек",
          restSeconds: 30,
          instructions: "Shoulders down, move from the joint.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Ягодичный мостик на одной ноге",
          sets: 4,
          reps: "24",
          restSeconds: 55,
          instructions: "12 повторений на каждую ногу, пауза вверху.",
          equipment: "none",
        },
        {
          name: "Single-leg glute bridge",
          sets: 4,
          reps: "24",
          restSeconds: 55,
          instructions: "12 reps per leg, squeeze at the top.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Отжимания",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Полная амплитуда, корпус жёсткий.",
          equipment: "none",
        },
        {
          name: "Push-ups",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Full range, rigid torso.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Приседания с прыжком",
          sets: 3,
          reps: "10",
          restSeconds: 65,
          instructions: "Мягкое приземление, колени по носкам.",
          equipment: "none",
        },
        {
          name: "Jump squats",
          sets: 3,
          reps: "10",
          restSeconds: 65,
          instructions: "Soft landing, knees over toes.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Модифицированное отжимание на предплечья",
          sets: 3,
          reps: "20",
          restSeconds: 50,
          instructions: "Упор на предплечья, корпус в планке, малые движения вперёд-назад.",
          equipment: "none",
        },
        {
          name: "Modified forearm push-up",
          sets: 3,
          reps: "20",
          restSeconds: 50,
          instructions: "Forearm plank, small forward-back shifts.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Передняя планка",
          sets: 3,
          reps: "45 сек",
          restSeconds: 45,
          instructions: "Держите ровную линию от головы до пяток.",
          equipment: "none",
        },
        {
          name: "Front plank",
          sets: 3,
          reps: "45 сек",
          restSeconds: 45,
          instructions: "Straight line from head to heels.",
          equipment: "none",
        },
      ),
    ],
  },
  {
    dayKey: "home_c",
    labels: { ru: "Дом · Тренировка C", en: "Home · Workout C" },
    focus: {
      ru: ["кор", "пресс", "стабилизация"],
      en: ["core", "abs", "stability"],
    },
    totalMinutes: 50,
    description: {
      ru: "Разминка, кор и пресс: скручивания, супермен, медвежья и боковая планка.",
      en: "Warm-up, core work: twists, superman, bear and side plank.",
    },
    exercises: [
      homeEx(
        {
          name: "Круговые движения руками",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Плавный темп, дышите ровно.",
          equipment: "none",
        },
        {
          name: "Arm circles",
          sets: 1,
          reps: "120 сек",
          restSeconds: 30,
          instructions: "Smooth pace, steady breathing.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Вращение плечами",
          sets: 1,
          reps: "20",
          restSeconds: 30,
          instructions: "Ладони на плечах, локти описывают круг.",
          equipment: "none",
        },
        {
          name: "Shoulder rotations",
          sets: 1,
          reps: "20",
          restSeconds: 30,
          instructions: "Hands on shoulders, elbows draw circles.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Попеременные косые скручивания",
          sets: 1,
          reps: "20",
          restSeconds: 40,
          instructions: "Локоть к противоположному колену, по 10 на сторону.",
          equipment: "none",
        },
        {
          name: "Alternating bicycle crunches",
          sets: 1,
          reps: "20",
          restSeconds: 40,
          instructions: "Elbow to opposite knee, 10 per side.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Бег с высоким подниманием бедра",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Быстрый темп на месте.",
          equipment: "none",
        },
        {
          name: "High knees",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Fast pace in place.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Прыжки с разведением рук и ног",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Кардио-блок, мягкое приземление.",
          equipment: "none",
        },
        {
          name: "Jumping jacks",
          sets: 1,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "Cardio block, soft landing.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Негативный флаг дракона",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Упор за голову, медленное опускание ног (упрощённый вариант — ноги согнуты).",
          equipment: "none",
        },
        {
          name: "Negative dragon flag",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Hold behind head, slow leg lower (bent-knee regression if needed).",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Отжимания",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Контроль темпа, грудь к полу.",
          equipment: "none",
        },
        {
          name: "Push-ups",
          sets: 4,
          reps: "12",
          restSeconds: 60,
          instructions: "Controlled tempo, chest to floor.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Тяга Супермена",
          sets: 3,
          reps: "30",
          restSeconds: 50,
          instructions: "Лёжа на животе, подъём рук и ног, задержка 1 сек.",
          equipment: "none",
        },
        {
          name: "Superman pull",
          sets: 3,
          reps: "30",
          restSeconds: 50,
          instructions: "Prone, lift arms and legs, 1s hold at top.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Планка «Медведь»",
          sets: 3,
          reps: "30 сек",
          restSeconds: 45,
          instructions: "На четвереньках, колени на 2–3 см от пола.",
          equipment: "none",
        },
        {
          name: "Bear plank",
          sets: 3,
          reps: "30 сек",
          restSeconds: 45,
          instructions: "On all fours, knees hover 2–3 cm off the floor.",
          equipment: "none",
        },
      ),
      homeEx(
        {
          name: "Боковая планка",
          sets: 3,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "По 30 сек на каждую сторону в каждом подходе.",
          equipment: "none",
        },
        {
          name: "Side plank",
          sets: 3,
          reps: "60 сек",
          restSeconds: 45,
          instructions: "30 sec per side within each set.",
          equipment: "none",
        },
      ),
    ],
  },
];

export function homeWorkoutIndexForDate(isoDate: string): number {
  const len = HOME_READY_SPLITS.length;
  const idx = splitIndexForDate(isoDate) % len;
  return idx;
}

export function getHomeReadyDay(isoDate: string, locale: Locale): HomeReadyDay {
  return HOME_READY_SPLITS[homeWorkoutIndexForDate(isoDate)] ?? HOME_READY_SPLITS[0];
}

export function todayHomeWorkoutIndex(): number {
  return homeWorkoutIndexForDate(isoDateOnly());
}
