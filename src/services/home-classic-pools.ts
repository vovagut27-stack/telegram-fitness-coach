import type { FitnessLevel, WorkoutExercise } from "../types/workout.js";

export type MuscleFocus = "push" | "pull" | "legs";

export type LocalizedExercise = {
  ru: Omit<WorkoutExercise, "name"> & { name: string };
  en: Omit<WorkoutExercise, "name"> & { name: string };
};

/** Классические домашние упражнения без инвентаря. */
export const HOME_CLASSIC_POOLS: Record<
  MuscleFocus,
  Record<FitnessLevel, LocalizedExercise[]>
> = {
  push: {
    beginner: [
      ex("Вращения плечами", "Shoulder circles", "10-12", 30, "Круги вперёд и назад, плечи расслаблены."),
      ex("Отжимания с колен", "Knee push-ups", "8-10", 50, "Корпус прямой от колен до головы."),
      ex("Планка", "Plank hold", "25-35 сек", 45, "Локти под плечами, пресс напряжён."),
      ex("Прыжки с разведением рук", "Jumping jacks", "20-30", 40, "Мягко приземляйтесь на носки."),
      ex("Растяжка плеч", "Shoulder stretch", "25-30 сек", 30, "Рука через грудь, второй локоть прижимает."),
    ],
    intermediate: [
      ex("Отжимания от пола", "Standard push-ups", "10-12", 55, "Грудь почти касается пола."),
      ex("Планка", "Plank hold", "40-50 сек", 45, "Не провисайте в пояснице."),
      ex("Махи руками в стороны", "Lateral arm raises", "12-15", 40, "Ладони вниз, без рывков."),
      ex("Бёрпи", "Burpees", "6-8", 60, "Шаг назад вместо прыжка, если тяжело."),
      ex("Растяжка «кошка-корова»", "Cat-cow stretch", "8-10", 35, "Медленно прогиб и округление спины."),
    ],
    advanced: [
      ex("Отжимания от пола", "Standard push-ups", "12-15", 50, "В последних повторениях темп медленнее."),
      ex("Отжимания узким хватом", "Close-grip push-ups", "8-10", 55, "Локти вдоль корпуса."),
      ex("Бёрпи", "Burpees", "10-12", 65, "Прыжок вверх в конце, приземление мягко."),
      ex("Прыжки с разведением рук", "Jumping jacks", "30-40", 45, "Руки до уровня плеч."),
      ex("Планка", "Plank hold", "50-60 сек", 40, "Держите ровную линию."),
    ],
  },
  pull: {
    beginner: [
      ex("Вращения плечами", "Shoulder circles", "10-12", 30, "Разогрев плечевого пояса."),
      ex("Супермен", "Superman hold", "10-12", 45, "Подъём груди и ног, взгляд в пол."),
      ex("Птица-собака", "Bird-dog", "8-10", 45, "Противоположная рука и нога, корпус стабилен."),
      ex("Растяжка «кошка-корова»", "Cat-cow stretch", "8-10", 35, "Дышите ровно."),
      ex("Наклон вперёд стоя", "Standing forward fold", "25-30 сек", 35, "Колени слегка согнуты."),
    ],
    intermediate: [
      ex("Супермен", "Superman hold", "12-15", 50, "Задержка 1 сек вверху."),
      ex("Птица-собака", "Bird-dog", "10-12", 45, "Не раскачивайте корпус."),
      ex("Планка", "Plank hold", "35-45 сек", 45, "Пресс и ягодицы включены."),
      ex("Махи руками в стороны", "Lateral arm raises", "12-15", 40, "Контроль вниз."),
      ex("Растяжка плеч", "Shoulder stretch", "30 сек", 30, "По 15 сек на каждую сторону."),
    ],
    advanced: [
      ex("Супермен", "Superman hold", "15-18", 45, "Можно чередовать с bird-dog."),
      ex("Птица-собака", "Bird-dog", "12-14", 40, "Медленный темп."),
      ex("Боковая планка", "Side plank", "25-35 сек", 45, "Бёдра вверх, корпус в линию."),
      ex("Наклон вперёд стоя", "Standing forward fold", "35-40 сек", 35, "Расслабьте шею."),
      ex("Вращения плечами", "Shoulder circles", "15", 30, "Завершение разминки."),
    ],
  },
  legs: {
    beginner: [
      ex("Приседания", "Bodyweight squats", "12-15", 50, "Колени по направлению носков."),
      ex("Выпады назад", "Reverse lunges", "8-10", 55, "Шаг назад, корпус вертикально."),
      ex("Ягодичный мост", "Glute bridge", "12-15", 45, "Вверху сожмите ягодицы."),
      ex("Бег с высоким подниманием колена", "High knees", "30 сек", 45, "Корпус прямой, работают руки."),
      ex("Растяжка «кошка-корова»", "Cat-cow stretch", "8-10", 35, "Мобильность спины."),
    ],
    intermediate: [
      ex("Приседания", "Bodyweight squats", "15-18", 50, "Глубина до параллели бедра с полом."),
      ex("Выпады вперёд", "Forward lunges", "10-12", 55, "Колено задней ноги не касается пола резко."),
      ex("Бёрпи", "Burpees", "8-10", 60, "Темп умеренный."),
      ex("Бег с высоким подниманием колена", "High knees", "40 сек", 50, "Быстрый темп, мягкая стопа."),
      ex("Боковая планка", "Side plank", "20-30 сек", 45, "На каждую сторону."),
    ],
    advanced: [
      ex("Выпады с прыжком", "Jumping lunges", "8-10", 65, "Смена ног в прыжке."),
      ex("Приседания", "Bodyweight squats", "18-20", 50, "Можно пауза 2 сек внизу."),
      ex("Бёрпи", "Burpees", "10-12", 65, "Полная амплитуда."),
      ex("Прыжки с разведением рук", "Jumping jacks", "35-45", 45, "Кардио-финиш."),
      ex("Наклон вперёд стоя", "Standing forward fold", "40 сек", 35, "Растяжка задней поверхности бедра."),
    ],
  },
};

function ex(
  nameRu: string,
  nameEn: string,
  reps: string,
  rest: number,
  instructionsRu: string,
): LocalizedExercise {
  const base = {
    sets: 3,
    equipment: "none" as const,
  };
  return {
    ru: {
      ...base,
      name: nameRu,
      reps,
      restSeconds: rest,
      instructions: instructionsRu,
    },
    en: {
      ...base,
      name: nameEn,
      reps,
      restSeconds: rest,
      instructions: instructionsEn(nameRu, instructionsRu),
    },
  };
}

function instructionsEn(ruName: string, ruText: string): string {
  const map: Record<string, string> = {
    "Вращения плечами": "Circles forward and back, shoulders relaxed.",
    "Отжимания с колен": "Straight line from knees to head.",
    Планка: "Elbows under shoulders, core tight.",
    "Прыжки с разведением рук": "Land softly on the balls of your feet.",
    "Растяжка плеч": "Arm across chest, other elbow presses gently.",
    "Отжимания от пола": "Chest nearly touches the floor.",
    "Махи руками в стороны": "Palms down, no jerking.",
    Бёрпи: "Step back instead of jumping if needed.",
    "Растяжка «кошка-корова»": "Slow arch and round of the spine.",
    "Отжимания узким хватом": "Elbows stay close to your ribs.",
    Супермен: "Lift chest and legs, gaze at the floor.",
    "Птица-собака": "Opposite arm and leg, stable torso.",
    "Наклон вперёд стоя": "Knees slightly bent.",
    "Боковая планка": "Hips up, body in one line.",
    Приседания: "Knees track over toes.",
    "Выпады назад": "Step back, torso upright.",
    "Ягодичный мост": "Squeeze glutes at the top.",
    "Бег с высоким подниманием колена": "Upright torso, active arms.",
    "Выпады вперёд": "Rear knee lowers under control.",
    "Выпады с прыжком": "Switch legs in the air.",
  };
  return map[ruName] ?? ruText;
}

export const HOME_FOCUS_LABELS: Record<MuscleFocus, Record<"ru" | "en", string[]>> = {
  push: {
    ru: ["грудь", "трицепс", "плечи"],
    en: ["chest", "triceps", "shoulders"],
  },
  pull: {
    ru: ["спина", "кор", "мобильность"],
    en: ["back", "core", "mobility"],
  },
  legs: {
    ru: ["ноги", "ягодицы", "пресс"],
    en: ["legs", "glutes", "core"],
  },
};
