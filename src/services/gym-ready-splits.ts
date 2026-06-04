import type { WorkoutExercise } from "../types/workout.js";

type LocalizedEx = { ru: WorkoutExercise; en: WorkoutExercise };

type GymDayTemplate = {
  dayKey: string;
  labels: { ru: string; en: string };
  focus: { ru: string; en: string };
  totalMinutes: number;
  description: { ru: string; en: string };
  exercises: LocalizedEx[];
};

function gymEx(
  ru: Omit<WorkoutExercise, "name"> & { name: string },
  en: Omit<WorkoutExercise, "name"> & { name: string },
): LocalizedEx {
  return { ru, en };
}

/** Готовые зальные тренировки (как в референс-приложении). */
export const GYM_READY_SPLITS: GymDayTemplate[] = [
  {
    dayKey: "chest_shoulders",
    labels: { ru: "Грудь · Плечи", en: "Chest · Shoulders" },
    focus: { ru: "Грудь и плечи", en: "Chest and shoulders" },
    totalMinutes: 49,
    description: {
      ru: "Тренировка груди и плеч среднего уровня с увеличенными весами. Жимы штанги и гантелей на наклонной скамье развивают жимовую силу, разводки изолируют грудные, а подъёмы через стороны и жимы в тренажёре обеспечивают всестороннее развитие плеч.",
      en: "Intermediate chest and shoulders with progressive loads. Barbell and incline dumbbell presses build pressing strength, flyes isolate the chest, and lateral raises plus machine work develop the shoulders.",
    },
    exercises: [
      gymEx(
        {
          name: "Жим штанги лежа",
          sets: 4,
          reps: "8",
          weightKg: 30,
          restSeconds: 90,
          instructions: "Лопатки сведены, стопы на полу, контроль негативной фазы.",
          equipment: "barbell",
        },
        {
          name: "Barbell bench press",
          sets: 4,
          reps: "8",
          weightKg: 30,
          restSeconds: 90,
          instructions: "Retract shoulder blades, feet flat, controlled eccentric.",
          equipment: "barbell",
        },
      ),
      gymEx(
        {
          name: "Жим гантелей на наклонной скамье",
          sets: 3,
          reps: "8",
          weightKg: 18,
          restSeconds: 75,
          instructions: "Угол скамьи 30°, гантели к верху груди.",
          equipment: "dumbbell",
        },
        {
          name: "Incline dumbbell press",
          sets: 3,
          reps: "8",
          weightKg: 18,
          restSeconds: 75,
          instructions: "30° bench, dumbbells to upper chest.",
          equipment: "dumbbell",
        },
      ),
      gymEx(
        {
          name: "Сведения рук в тренажере бабочка",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 60,
          instructions: "Сведите руки перед грудью, пауза 1 сек.",
          equipment: "machine",
        },
        {
          name: "Pec deck machine",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 60,
          instructions: "Squeeze at the center, 1s pause.",
          equipment: "machine",
        },
      ),
      gymEx(
        {
          name: "Армейский жим штанги стоя",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 75,
          instructions: "Корпус напряжён, штанга к подбородку без рывка.",
          equipment: "barbell",
        },
        {
          name: "Standing barbell press",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 75,
          instructions: "Brace core, press without jerking.",
          equipment: "barbell",
        },
      ),
      gymEx(
        {
          name: "Разведения гантелей в стороны",
          sets: 3,
          reps: "12",
          weightKg: 9,
          restSeconds: 60,
          instructions: "Локти чуть согнуты, подъём до уровня плеч.",
          equipment: "dumbbell",
        },
        {
          name: "Dumbbell lateral raise",
          sets: 3,
          reps: "12",
          weightKg: 9,
          restSeconds: 60,
          instructions: "Slight elbow bend, raise to shoulder height.",
          equipment: "dumbbell",
        },
      ),
      gymEx(
        {
          name: "Тяга штанги к подбородку",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 60,
          instructions: "Локти ведут движение, штанга близко к телу.",
          equipment: "barbell",
        },
        {
          name: "Barbell upright row",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 60,
          instructions: "Lead with elbows, bar close to the body.",
          equipment: "barbell",
        },
      ),
    ],
  },
  {
    dayKey: "legs_shoulders",
    labels: { ru: "Ноги · Плечи", en: "Legs · Shoulders" },
    focus: { ru: "Ноги и плечи", en: "Legs and shoulders" },
    totalMinutes: 52,
    description: {
      ru: "Тренировка на ноги среднего уровня с проработкой плеч. Выпады, жим ногами, разгибания и икры нагружают ноги, жимы и разведения — плечи.",
      en: "Intermediate leg day with shoulder work. Lunges, leg press, extensions and calves load the legs; presses and raises hit the shoulders.",
    },
    exercises: [
      gymEx(
        {
          name: "Выпады с гантелями",
          sets: 3,
          reps: "8",
          weightKg: 15,
          restSeconds: 75,
          instructions: "Шаг вперёд, колено задней ноги почти к полу.",
          equipment: "dumbbell",
        },
        {
          name: "Dumbbell lunges",
          sets: 3,
          reps: "8",
          weightKg: 15,
          restSeconds: 75,
          instructions: "Step forward, back knee nearly to the floor.",
          equipment: "dumbbell",
        },
      ),
      gymEx(
        {
          name: "Жим ногами в тренажёре сидя",
          sets: 4,
          reps: "12",
          weightKg: 60,
          restSeconds: 90,
          instructions: "Не отрывайте поясницу от спинки.",
          equipment: "machine",
        },
        {
          name: "Seated leg press",
          sets: 4,
          reps: "12",
          weightKg: 60,
          restSeconds: 90,
          instructions: "Keep lower back on the pad.",
          equipment: "machine",
        },
      ),
      gymEx(
        {
          name: "Разгибание ног в рычажном тренажере",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 60,
          instructions: "Пауза в верхней точке, без рывка.",
          equipment: "machine",
        },
        {
          name: "Lever leg extension",
          sets: 3,
          reps: "12",
          weightKg: 22,
          restSeconds: 60,
          instructions: "Squeeze at the top, no jerking.",
          equipment: "machine",
        },
      ),
      gymEx(
        {
          name: "Жим носками сидя в рычажном тренажере",
          sets: 4,
          reps: "12",
          weightKg: 30,
          restSeconds: 60,
          instructions: "Полная амплитуда, пауза в растяжке.",
          equipment: "machine",
        },
        {
          name: "Seated calf press",
          sets: 4,
          reps: "12",
          weightKg: 30,
          restSeconds: 60,
          instructions: "Full range, pause at the stretch.",
          equipment: "machine",
        },
      ),
      gymEx(
        {
          name: "Жим гантелей над головой стоя",
          sets: 3,
          reps: "10",
          weightKg: 12,
          restSeconds: 75,
          instructions: "Корпус стабилен, не прогибайте поясницу.",
          equipment: "dumbbell",
        },
        {
          name: "Standing overhead dumbbell press",
          sets: 3,
          reps: "10",
          weightKg: 12,
          restSeconds: 75,
          instructions: "Stable torso, avoid over-arching.",
          equipment: "dumbbell",
        },
      ),
      gymEx(
        {
          name: "Разведения гантелей в стороны",
          sets: 3,
          reps: "12",
          weightKg: 9,
          restSeconds: 60,
          instructions: "Локти чуть согнуты, подъём до уровня плеч.",
          equipment: "dumbbell",
        },
        {
          name: "Dumbbell lateral raise",
          sets: 3,
          reps: "12",
          weightKg: 9,
          restSeconds: 60,
          instructions: "Slight elbow bend, raise to shoulder height.",
          equipment: "dumbbell",
        },
      ),
    ],
  },
];
