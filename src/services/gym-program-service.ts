import type { Locale } from "../types/locale.js";
import type { FitnessLevel, GymProgram, GymProgramDay, WorkoutExercise, WorkoutPlan } from "../types/workout.js";
import type { UserProfile } from "../database/users-repo.js";
import { calcBmi } from "../types/profile.js";

type LocalizedEx = { ru: WorkoutExercise; en: WorkoutExercise };

function ex(
  ru: Omit<WorkoutExercise, "name"> & { name: string },
  en: Omit<WorkoutExercise, "name"> & { name: string },
): LocalizedEx {
  return { ru, en };
}

const GYM_SPLITS: Record<
  FitnessLevel,
  Array<{
    dayKey: string;
    labels: { ru: string; en: string };
    focus: { ru: string; en: string };
    exercises: LocalizedEx[];
  }>
> = {
  beginner: [
    {
      dayKey: "chest_triceps",
      labels: { ru: "День A", en: "Day A" },
      focus: { ru: "Грудь и трицепс", en: "Chest & triceps" },
      exercises: [
        ex(
          {
            name: "Жим штанги лёжа",
            sets: 3,
            reps: "8-10",
            restSeconds: 90,
            instructions: "Лопатки сведены, стопы на полу.",
            equipment: "barbell",
          },
          {
            name: "Barbell bench press",
            sets: 3,
            reps: "8-10",
            restSeconds: 90,
            instructions: "Retract shoulder blades, feet flat.",
            equipment: "barbell",
          },
        ),
        ex(
          {
            name: "Жим гантелей на наклонной",
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
            instructions: "Угол 30°, локти под 45°.",
            equipment: "dumbbell",
          },
          {
            name: "Incline dumbbell press",
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
            instructions: "30° bench, controlled tempo.",
            equipment: "dumbbell",
          },
        ),
        ex(
          {
            name: "Разводка гантелей",
            sets: 3,
            reps: "12",
            restSeconds: 60,
            instructions: "Лёгкая растяжка внизу.",
            equipment: "dumbbell",
          },
          {
            name: "Dumbbell flyes",
            sets: 3,
            reps: "12",
            restSeconds: 60,
            instructions: "Soft stretch at the bottom.",
            equipment: "dumbbell",
          },
        ),
        ex(
          {
            name: "Кроссовер / блок",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Сведите руки перед грудью.",
            equipment: "cable",
          },
          {
            name: "Cable crossover",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Squeeze at the center.",
            equipment: "cable",
          },
        ),
        ex(
          {
            name: "Разгибание на блоке (трицепс)",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Локти прижаты к корпусу.",
            equipment: "cable",
          },
          {
            name: "Cable triceps pushdown",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Elbows tucked, full extension.",
            equipment: "cable",
          },
        ),
      ],
    },
    {
      dayKey: "back_biceps",
      labels: { ru: "День B", en: "Day B" },
      focus: { ru: "Спина и бицепс", en: "Back & biceps" },
      exercises: [
        ex(
          {
            name: "Подтягивания / гравитрон",
            sets: 3,
            reps: "6-10",
            restSeconds: 90,
            instructions: "Грудь к перекладине.",
            equipment: "machine",
          },
          {
            name: "Pull-ups / assisted",
            sets: 3,
            reps: "6-10",
            restSeconds: 90,
            instructions: "Chest toward the bar.",
            equipment: "machine",
          },
        ),
        ex(
          {
            name: "Тяга верхнего блока",
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
            instructions: "Тяните локтями вниз.",
            equipment: "cable",
          },
          {
            name: "Lat pulldown",
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
            instructions: "Drive elbows down.",
            equipment: "cable",
          },
        ),
        ex(
          {
            name: "Тяга гантели в наклоне",
            sets: 3,
            reps: "10",
            restSeconds: 75,
            instructions: "Спина параллельно полу.",
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
            instructions: "Сведите лопатки в конце.",
            equipment: "cable",
          },
          {
            name: "Seated cable row",
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
            instructions: "Squeeze shoulder blades.",
            equipment: "cable",
          },
        ),
        ex(
          {
            name: "Сгибание штанги",
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
            instructions: "Без раскачки корпуса.",
            equipment: "barbell",
          },
          {
            name: "Barbell curl",
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
            instructions: "Strict form, no sway.",
            equipment: "barbell",
          },
        ),
      ],
    },
    {
      dayKey: "legs",
      labels: { ru: "День C", en: "Day C" },
      focus: { ru: "Ноги", en: "Legs" },
      exercises: [
        ex(
          {
            name: "Присед со штангой",
            sets: 4,
            reps: "8-10",
            restSeconds: 120,
            instructions: "Глубина параллель или ниже.",
            equipment: "barbell",
          },
          {
            name: "Barbell back squat",
            sets: 4,
            reps: "8-10",
            restSeconds: 120,
            instructions: "Break parallel if mobile.",
            equipment: "barbell",
          },
        ),
        ex(
          {
            name: "Жим ногами",
            sets: 3,
            reps: "12",
            restSeconds: 90,
            instructions: "Не отрывайте поясницу.",
            equipment: "machine",
          },
          {
            name: "Leg press",
            sets: 3,
            reps: "12",
            restSeconds: 90,
            instructions: "Keep lower back on pad.",
            equipment: "machine",
          },
        ),
        ex(
          {
            name: "Румынская тяга",
            sets: 3,
            reps: "10",
            restSeconds: 90,
            instructions: "Таз назад, спина нейтральная.",
            equipment: "barbell",
          },
          {
            name: "Romanian deadlift",
            sets: 3,
            reps: "10",
            restSeconds: 90,
            instructions: "Hinge hips, neutral spine.",
            equipment: "barbell",
          },
        ),
        ex(
          {
            name: "Разгибание ног",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Пауза в верхней точке.",
            equipment: "machine",
          },
          {
            name: "Leg extension",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Squeeze quads at top.",
            equipment: "machine",
          },
        ),
        ex(
          {
            name: "Сгибание ног",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Контроль негативной фазы.",
            equipment: "machine",
          },
          {
            name: "Leg curl",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Slow eccentric.",
            equipment: "machine",
          },
        ),
        ex(
          {
            name: "Подъём на носки стоя",
            sets: 4,
            reps: "15",
            restSeconds: 45,
            instructions: "Полная амплитуда.",
            equipment: "machine",
          },
          {
            name: "Standing calf raise",
            sets: 4,
            reps: "15",
            restSeconds: 45,
            instructions: "Full stretch and squeeze.",
            equipment: "machine",
          },
        ),
      ],
    },
    {
      dayKey: "shoulders_arms",
      labels: { ru: "День D", en: "Day D" },
      focus: { ru: "Плечи и руки", en: "Shoulders & arms" },
      exercises: [
        ex(
          {
            name: "Жим гантелей сидя",
            sets: 3,
            reps: "8-10",
            restSeconds: 90,
            instructions: "Не прогибайте поясницу.",
            equipment: "dumbbell",
          },
          {
            name: "Seated dumbbell press",
            sets: 3,
            reps: "8-10",
            restSeconds: 90,
            instructions: "Core tight, no overarch.",
            equipment: "dumbbell",
          },
        ),
        ex(
          {
            name: "Махи в стороны",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Локти чуть согнуты.",
            equipment: "dumbbell",
          },
          {
            name: "Lateral raises",
            sets: 3,
            reps: "12-15",
            restSeconds: 60,
            instructions: "Lead with elbows.",
            equipment: "dumbbell",
          },
        ),
        ex(
          {
            name: "Махи в наклоне",
            sets: 3,
            reps: "12",
            restSeconds: 60,
            instructions: "Задняя дельта.",
            equipment: "dumbbell",
          },
          {
            name: "Rear delt fly",
            sets: 3,
            reps: "12",
            restSeconds: 60,
            instructions: "Squeeze rear delts.",
            equipment: "dumbbell",
          },
        ),
        ex(
          {
            name: "Французский жим",
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
            instructions: "Локти в одной плоскости.",
            equipment: "barbell",
          },
          {
            name: "Skull crushers",
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
            instructions: "Elbows fixed.",
            equipment: "barbell",
          },
        ),
        ex(
          {
            name: "Молотковые сгибания",
            sets: 3,
            reps: "12",
            restSeconds: 60,
            instructions: "Нейтральный хват.",
            equipment: "dumbbell",
          },
          {
            name: "Hammer curls",
            sets: 3,
            reps: "12",
            restSeconds: 60,
            instructions: "Neutral grip throughout.",
            equipment: "dumbbell",
          },
        ),
      ],
    },
  ],
  intermediate: [],
  advanced: [],
};

// Clone beginner structure with higher volume for intermediate/advanced
GYM_SPLITS.intermediate = GYM_SPLITS.beginner.map((day) => ({
  ...day,
  exercises: day.exercises.map((item) => ({
    ru: { ...item.ru, sets: item.ru.sets + 1, reps: item.ru.reps.replace("8", "6").replace("10", "8") },
    en: { ...item.en, sets: item.en.sets + 1, reps: item.en.reps.replace("8", "6").replace("10", "8") },
  })),
}));

GYM_SPLITS.advanced = GYM_SPLITS.beginner.map((day) => ({
  ...day,
  exercises: day.exercises.map((item) => ({
    ru: { ...item.ru, sets: item.ru.sets + 2, restSeconds: item.ru.restSeconds + 15 },
    en: { ...item.en, sets: item.en.sets + 2, restSeconds: item.en.restSeconds + 15 },
  })),
}));

function dayPlan(
  split: (typeof GYM_SPLITS.beginner)[0],
  locale: Locale,
  level: FitnessLevel,
  user: UserProfile,
): WorkoutPlan {
  const exercises = split.exercises.map((e) => (locale === "en" ? e.en : e.ru));
  const minutes = Math.round(user.timePerSession || 50);
  const bmi =
    user.weightKg && user.heightCm ? calcBmi(user.weightKg, user.heightCm) : null;
  const noteRu =
    bmi != null
      ? `Персонально: BMI ${bmi}, ${user.gender === "female" ? "жен." : user.gender === "male" ? "муж." : ""} ${user.age ?? ""} лет. Разминка 8 мин.`
      : "Разминка 8 мин, растяжка 5 мин.";
  const noteEn =
    bmi != null
      ? `Personalized: BMI ${bmi}, age ${user.age ?? "—"}. Warm-up 8 min.`
      : "Warm-up 8 min, cool-down 5 min.";

  return {
    targetMuscles: [locale === "en" ? split.focus.en : split.focus.ru],
    exercises,
    totalMinutes: minutes,
    difficultyLevel: level,
    programType: "gym",
    splitDay: split.dayKey,
    notes: locale === "en" ? noteEn : noteRu,
  };
}

export function buildGymProgram(user: UserProfile): GymProgram {
  const locale = user.language;
  const split = GYM_SPLITS[user.fitnessLevel] ?? GYM_SPLITS.beginner;

  const days: GymProgramDay[] = split.map((d) => ({
    dayKey: d.dayKey,
    dayLabel: locale === "en" ? d.labels.en : d.labels.ru,
    focus: locale === "en" ? d.focus.en : d.focus.ru,
    plan: dayPlan(d, locale, user.fitnessLevel, user),
  }));

  return {
    title: locale === "en" ? "4-Day Gym Split" : "Программа зала на 4 дня",
    subtitle:
      locale === "en"
        ? "Premium program • barbell, machines, cables"
        : "Премиум • штанга, тренажёры, блоки",
    days,
  };
}

export function todayGymDayIndex(): number {
  return new Date().getDay() % 4;
}

export function getTodayGymWorkout(user: UserProfile): WorkoutPlan {
  const program = buildGymProgram(user);
  const idx = todayGymDayIndex();
  return program.days[idx]?.plan ?? program.days[0].plan;
}
