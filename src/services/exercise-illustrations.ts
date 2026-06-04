import { normalizeExerciseName } from "./exercise-image-catalog.js";

/** Локальные SVG в webapp/public/exercises/ */
export type IllustrationSlug =
  | "push-up"
  | "knee-push-up"
  | "close-grip-push-up"
  | "pike-push-up"
  | "triceps-dip"
  | "plank"
  | "side-plank"
  | "reverse-plank"
  | "lunge"
  | "lateral-lunge"
  | "squat"
  | "sumo-squat"
  | "squat-jump"
  | "wall-sit"
  | "calf-raise"
  | "burpee"
  | "jumping-jack"
  | "high-knees"
  | "mountain-climber"
  | "shoulder-rotation"
  | "arm-raise"
  | "stretch"
  | "cat-cow"
  | "bird-dog"
  | "glute-bridge"
  | "superman"
  | "crunch"
  | "bicycle-crunch"
  | "pull-up"
  | "inverted-row"
  | "hip-hinge"
  | "hollow-body"
  | "bench-press"
  | "incline-press"
  | "chest-fly"
  | "cable-crossover"
  | "cable-triceps"
  | "lat-pulldown"
  | "cable-row"
  | "dumbbell-row"
  | "barbell-curl"
  | "hammer-curl"
  | "barbell-squat"
  | "leg-press"
  | "romanian-deadlift"
  | "leg-extension"
  | "leg-curl"
  | "overhead-press"
  | "rear-delt-fly"
  | "skull-crusher"
  | "generic-workout";

const EXACT_SLUG: Record<string, IllustrationSlug> = {
  // Push / chest / triceps (home)
  [normalizeExerciseName("Отжимания от пола")]: "push-up",
  [normalizeExerciseName("Standard push-ups")]: "push-up",
  [normalizeExerciseName("Отжимания с колен")]: "knee-push-up",
  [normalizeExerciseName("Knee push-ups")]: "knee-push-up",
  [normalizeExerciseName("Отжимания узким хватом")]: "close-grip-push-up",
  [normalizeExerciseName("Close-grip push-ups")]: "close-grip-push-up",
  [normalizeExerciseName("Алмазные отжимания")]: "close-grip-push-up",
  [normalizeExerciseName("Diamond push-ups")]: "close-grip-push-up",
  [normalizeExerciseName("Отжимания в стойке у стены (pike)")]: "pike-push-up",
  [normalizeExerciseName("Pike push-ups")]: "pike-push-up",
  [normalizeExerciseName("Отжимания ноги на возвышении")]: "pike-push-up",
  [normalizeExerciseName("Decline push-ups")]: "pike-push-up",
  [normalizeExerciseName("Отжимания «лучник»")]: "push-up",
  [normalizeExerciseName("Archer push-ups")]: "push-up",
  [normalizeExerciseName("Отжимания с хлопком")]: "push-up",
  [normalizeExerciseName("Clap push-ups")]: "push-up",
  [normalizeExerciseName("Отжимания на одной руке (с опорой)")]: "push-up",
  [normalizeExerciseName("Assisted one-arm push-ups")]: "push-up",
  [normalizeExerciseName("Глубокие отжимания между стульями")]: "triceps-dip",
  [normalizeExerciseName("Deep chair push-ups")]: "triceps-dip",
  [normalizeExerciseName("Обратные отжимания от стула")]: "triceps-dip",
  [normalizeExerciseName("Chair triceps dips")]: "triceps-dip",
  [normalizeExerciseName("Планка")]: "plank",
  [normalizeExerciseName("Plank hold")]: "plank",
  [normalizeExerciseName("Планка с касанием плеча")]: "plank",
  [normalizeExerciseName("Plank shoulder taps")]: "plank",
  [normalizeExerciseName("Планка с подъёмом ног")]: "plank",
  [normalizeExerciseName("Plank leg raises")]: "plank",
  [normalizeExerciseName("Боковая планка")]: "side-plank",
  [normalizeExerciseName("Side plank")]: "side-plank",
  [normalizeExerciseName("Обратная планка")]: "reverse-plank",
  [normalizeExerciseName("Reverse plank")]: "reverse-plank",
  [normalizeExerciseName("Прыжки с разведением рук")]: "jumping-jack",
  [normalizeExerciseName("Jumping jacks")]: "jumping-jack",
  [normalizeExerciseName("Бёрпи")]: "burpee",
  [normalizeExerciseName("Burpees")]: "burpee",
  [normalizeExerciseName("Выпады в ходьбе")]: "lunge",
  [normalizeExerciseName("Walking lunges")]: "lunge",
  [normalizeExerciseName("Круговые движения руками")]: "arm-raise",
  [normalizeExerciseName("Arm circles")]: "arm-raise",
  [normalizeExerciseName("Прыжки с разведением рук и ног")]: "jumping-jack",
  [normalizeExerciseName("Бег с высоким подниманием бедра")]: "high-knees",
  [normalizeExerciseName("Приседания у скамьи с собственным весом")]: "wall-sit",
  [normalizeExerciseName("Bench bodyweight squats")]: "wall-sit",
  [normalizeExerciseName("Отжимания")]: "push-up",
  [normalizeExerciseName("Push-ups")]: "push-up",
  [normalizeExerciseName("Приседания на корточках")]: "squat",
  [normalizeExerciseName("Deep squats")]: "squat",
  [normalizeExerciseName("Алмазные отжимания")]: "close-grip-push-up",
  [normalizeExerciseName("Diamond push-ups")]: "close-grip-push-up",
  [normalizeExerciseName("Передняя планка")]: "plank",
  [normalizeExerciseName("Front plank")]: "plank",
  [normalizeExerciseName("Растяжка сгибателей бедра стоя")]: "stretch",
  [normalizeExerciseName("Standing hip flexor stretch")]: "stretch",
  [normalizeExerciseName("Прыжки конькобежца")]: "jumping-jack",
  [normalizeExerciseName("Skater jumps")]: "jumping-jack",
  [normalizeExerciseName("Ягодичный мостик на одной ноге")]: "glute-bridge",
  [normalizeExerciseName("Single-leg glute bridge")]: "glute-bridge",
  [normalizeExerciseName("Приседания с прыжком")]: "squat-jump",
  [normalizeExerciseName("Jump squats")]: "squat-jump",
  [normalizeExerciseName("Модифицированное отжимание на предплечья")]: "plank",
  [normalizeExerciseName("Modified forearm push-up")]: "plank",
  [normalizeExerciseName("Вращение плечами")]: "shoulder-rotation",
  [normalizeExerciseName("Shoulder rotations")]: "shoulder-rotation",
  [normalizeExerciseName("Попеременные косые скручивания")]: "bicycle-crunch",
  [normalizeExerciseName("Alternating bicycle crunches")]: "bicycle-crunch",
  [normalizeExerciseName("Негативный флаг дракона")]: "hollow-body",
  [normalizeExerciseName("Negative dragon flag")]: "hollow-body",
  [normalizeExerciseName("Тяга Супермена")]: "superman",
  [normalizeExerciseName("Superman pull")]: "superman",
  [normalizeExerciseName("Планка «Медведь»")]: "plank",
  [normalizeExerciseName("Bear plank")]: "plank",
  [normalizeExerciseName("Бёрпи без прыжка")]: "burpee",
  [normalizeExerciseName("No-jump burpees")]: "burpee",
  [normalizeExerciseName("Бёрпи полные")]: "burpee",
  [normalizeExerciseName("Full burpees")]: "burpee",
  [normalizeExerciseName("Бег с высоким подниманием колена")]: "high-knees",
  [normalizeExerciseName("High knees")]: "high-knees",
  [normalizeExerciseName("Скалолаз")]: "mountain-climber",
  [normalizeExerciseName("Mountain climbers")]: "mountain-climber",
  [normalizeExerciseName("Вращения плечами")]: "shoulder-rotation",
  [normalizeExerciseName("Shoulder circles")]: "shoulder-rotation",
  [normalizeExerciseName("Махи руками в стороны")]: "arm-raise",
  [normalizeExerciseName("Lateral arm raises")]: "arm-raise",
  [normalizeExerciseName("Подъёмы рук в стороны")]: "arm-raise",
  [normalizeExerciseName("Подъёмы рук в стороны (без веса)")]: "arm-raise",
  [normalizeExerciseName("Супермен для плеч")]: "superman",
  [normalizeExerciseName("Prone y-raises")]: "superman",
  // Pull / back / core
  [normalizeExerciseName("Супермен")]: "superman",
  [normalizeExerciseName("Superman hold")]: "superman",
  [normalizeExerciseName("Птица-собака")]: "bird-dog",
  [normalizeExerciseName("Bird-dog")]: "bird-dog",
  [normalizeExerciseName("Растяжка «кошка-корова»")]: "cat-cow",
  [normalizeExerciseName("Cat-cow stretch")]: "cat-cow",
  [normalizeExerciseName("Скручивания на пресс")]: "crunch",
  [normalizeExerciseName("Crunches")]: "crunch",
  [normalizeExerciseName("Велосипед для пресса")]: "bicycle-crunch",
  [normalizeExerciseName("Bicycle crunches")]: "bicycle-crunch",
  [normalizeExerciseName("Скручивания «велосипед»")]: "bicycle-crunch",
  [normalizeExerciseName("Slow bicycle crunches")]: "bicycle-crunch",
  [normalizeExerciseName("Подтягивания (или негативы)")]: "pull-up",
  [normalizeExerciseName("Pull-ups (or negatives)")]: "pull-up",
  [normalizeExerciseName("Подтягивания обратным хватом")]: "pull-up",
  [normalizeExerciseName("Chin-ups")]: "pull-up",
  [normalizeExerciseName("Австралийские подтягивания под столом")]: "inverted-row",
  [normalizeExerciseName("Inverted table rows")]: "inverted-row",
  [normalizeExerciseName("Тяга полотенца к поясу")]: "inverted-row",
  [normalizeExerciseName("Towel door rows")]: "inverted-row",
  [normalizeExerciseName("Тяга в наклоне с рюкзаком")]: "dumbbell-row",
  [normalizeExerciseName("Backpack bent-over rows")]: "dumbbell-row",
  [normalizeExerciseName("Сгибание рук с полотенцем")]: "barbell-curl",
  [normalizeExerciseName("Towel biceps curls")]: "barbell-curl",
  [normalizeExerciseName("Пуловер с полотенцем")]: "hip-hinge",
  [normalizeExerciseName("Towel pullovers")]: "hip-hinge",
  [normalizeExerciseName("Обратные снежинки")]: "rear-delt-fly",
  [normalizeExerciseName("Prone reverse flies")]: "rear-delt-fly",
  [normalizeExerciseName("Планка с греблей")]: "inverted-row",
  [normalizeExerciseName("Plank rows")]: "inverted-row",
  [normalizeExerciseName("Сгибания рук с полотенцем")]: "barbell-curl",
  [normalizeExerciseName("Towel biceps curls")]: "barbell-curl",
  [normalizeExerciseName("Молитвенное сгибание с полотенцем")]: "hammer-curl",
  [normalizeExerciseName("Towel hammer curls")]: "hammer-curl",
  [normalizeExerciseName("Складной нож (v-up)")]: "hollow-body",
  [normalizeExerciseName("V-ups")]: "hollow-body",
  [normalizeExerciseName("Лодочка")]: "hollow-body",
  [normalizeExerciseName("Boat hold")]: "hollow-body",
  // Legs
  [normalizeExerciseName("Приседания")]: "squat",
  [normalizeExerciseName("Bodyweight squats")]: "squat",
  [normalizeExerciseName("Присед «сумо»")]: "sumo-squat",
  [normalizeExerciseName("Sumo squats")]: "sumo-squat",
  [normalizeExerciseName("Прыжковые приседания (мягко)")]: "squat-jump",
  [normalizeExerciseName("Soft squat jumps")]: "squat-jump",
  [normalizeExerciseName("Пистолетик (с опорой)")]: "squat",
  [normalizeExerciseName("Assisted pistol squats")]: "squat",
  [normalizeExerciseName("Присед у стены")]: "wall-sit",
  [normalizeExerciseName("Wall sit")]: "wall-sit",
  [normalizeExerciseName("Подъёмы на носки")]: "calf-raise",
  [normalizeExerciseName("Calf raises")]: "calf-raise",
  [normalizeExerciseName("Выпады назад")]: "lunge",
  [normalizeExerciseName("Reverse lunges")]: "lunge",
  [normalizeExerciseName("Выпады вперёд")]: "lunge",
  [normalizeExerciseName("Forward lunges")]: "lunge",
  [normalizeExerciseName("Выпады с прыжком")]: "squat-jump",
  [normalizeExerciseName("Jumping lunges")]: "squat-jump",
  [normalizeExerciseName("Выпады в сторону")]: "lateral-lunge",
  [normalizeExerciseName("Lateral lunges")]: "lateral-lunge",
  [normalizeExerciseName("Ягодичный мост")]: "glute-bridge",
  [normalizeExerciseName("Glute bridge")]: "glute-bridge",
  [normalizeExerciseName("Мостик на одной ноге")]: "glute-bridge",
  [normalizeExerciseName("Single-leg glute bridge")]: "glute-bridge",
  [normalizeExerciseName("Наклон вперёд стоя")]: "stretch",
  [normalizeExerciseName("Standing forward fold")]: "stretch",
  [normalizeExerciseName("Растяжка плеч")]: "stretch",
  [normalizeExerciseName("Shoulder stretch")]: "stretch",
  // Gym
  [normalizeExerciseName("Жим штанги лёжа")]: "bench-press",
  [normalizeExerciseName("Жим штанги лежа")]: "bench-press",
  [normalizeExerciseName("Barbell bench press")]: "bench-press",
  [normalizeExerciseName("Жим гантелей на наклонной скамье")]: "incline-press",
  [normalizeExerciseName("Сведения рук в тренажере бабочка")]: "chest-fly",
  [normalizeExerciseName("Pec deck machine")]: "chest-fly",
  [normalizeExerciseName("Армейский жим штанги стоя")]: "overhead-press",
  [normalizeExerciseName("Standing barbell press")]: "overhead-press",
  [normalizeExerciseName("Разведения гантелей в стороны")]: "rear-delt-fly",
  [normalizeExerciseName("Dumbbell lateral raise")]: "rear-delt-fly",
  [normalizeExerciseName("Тяга штанги к подбородку")]: "hip-hinge",
  [normalizeExerciseName("Barbell upright row")]: "hip-hinge",
  [normalizeExerciseName("Выпады с гантелями")]: "lunge",
  [normalizeExerciseName("Dumbbell lunges")]: "lunge",
  [normalizeExerciseName("Жим ногами в тренажёре сидя")]: "leg-press",
  [normalizeExerciseName("Seated leg press")]: "leg-press",
  [normalizeExerciseName("Разгибание ног в рычажном тренажере")]: "leg-extension",
  [normalizeExerciseName("Lever leg extension")]: "leg-extension",
  [normalizeExerciseName("Жим носками сидя в рычажном тренажере")]: "calf-raise",
  [normalizeExerciseName("Seated calf press")]: "calf-raise",
  [normalizeExerciseName("Жим гантелей над головой стоя")]: "overhead-press",
  [normalizeExerciseName("Standing overhead dumbbell press")]: "overhead-press",
  [normalizeExerciseName("Жим штанги в наклоне")]: "incline-press",
  [normalizeExerciseName("Incline barbell press")]: "incline-press",
  [normalizeExerciseName("Жим гантелей на наклонной")]: "incline-press",
  [normalizeExerciseName("Incline dumbbell press")]: "incline-press",
  [normalizeExerciseName("Разводка гантелей лежа")]: "chest-fly",
  [normalizeExerciseName("Dumbbell chest fly")]: "chest-fly",
  [normalizeExerciseName("Разводка гантелей")]: "chest-fly",
  [normalizeExerciseName("Dumbbell flyes")]: "chest-fly",
  [normalizeExerciseName("Подтягивания")]: "pull-up",
  [normalizeExerciseName("Pull-ups")]: "pull-up",
  [normalizeExerciseName("Подтягивания / гравитрон")]: "pull-up",
  [normalizeExerciseName("Pull-ups / assisted")]: "pull-up",
  [normalizeExerciseName("Тяга верхнего блока")]: "lat-pulldown",
  [normalizeExerciseName("Lat pulldown")]: "lat-pulldown",
  [normalizeExerciseName("Тяга гантели в наклоне")]: "dumbbell-row",
  [normalizeExerciseName("Single-arm dumbbell row")]: "dumbbell-row",
  [normalizeExerciseName("Тяга горизонтальная")]: "cable-row",
  [normalizeExerciseName("Seated cable row")]: "cable-row",
  [normalizeExerciseName("Сгибание штанги")]: "barbell-curl",
  [normalizeExerciseName("Barbell curl")]: "barbell-curl",
  [normalizeExerciseName("Присед со штангой")]: "barbell-squat",
  [normalizeExerciseName("Barbell back squat")]: "barbell-squat",
  [normalizeExerciseName("Жим ногами")]: "leg-press",
  [normalizeExerciseName("Leg press")]: "leg-press",
  [normalizeExerciseName("Румынская тяга")]: "romanian-deadlift",
  [normalizeExerciseName("Romanian deadlift")]: "romanian-deadlift",
  [normalizeExerciseName("Разгибание ног")]: "leg-extension",
  [normalizeExerciseName("Leg extension")]: "leg-extension",
  [normalizeExerciseName("Сгибание ног")]: "leg-curl",
  [normalizeExerciseName("Leg curl")]: "leg-curl",
  [normalizeExerciseName("Подъём на носки стоя")]: "calf-raise",
  [normalizeExerciseName("Standing calf raise")]: "calf-raise",
  [normalizeExerciseName("Жим гантелей сидя")]: "overhead-press",
  [normalizeExerciseName("Seated dumbbell press")]: "overhead-press",
  [normalizeExerciseName("Махи в стороны")]: "arm-raise",
  [normalizeExerciseName("Lateral raises")]: "arm-raise",
  [normalizeExerciseName("Махи в наклоне")]: "rear-delt-fly",
  [normalizeExerciseName("Rear delt fly")]: "rear-delt-fly",
  [normalizeExerciseName("Французский жим")]: "skull-crusher",
  [normalizeExerciseName("Skull crushers")]: "skull-crusher",
  [normalizeExerciseName("Молотковые сгибания")]: "hammer-curl",
  [normalizeExerciseName("Hammer curls")]: "hammer-curl",
};

/** Порядок важен: более специфичные правила выше. */
const PATTERNS: Array<{ pattern: RegExp; slug: IllustrationSlug }> = [
  { pattern: /жим.*наклон|incline.*press/i, slug: "incline-press" },
  { pattern: /жим.*лёж|bench press|barbell bench/i, slug: "bench-press" },
  { pattern: /разводк|flye|fly\b/i, slug: "chest-fly" },
  { pattern: /кроссовер|crossover/i, slug: "cable-crossover" },
  { pattern: /разгибан.*блок|triceps pushdown|pushdown/i, slug: "cable-triceps" },
  { pattern: /французск|skull crush/i, slug: "skull-crusher" },
  { pattern: /верхн.*блок|lat pulldown|pulldown/i, slug: "lat-pulldown" },
  { pattern: /горизонт.*тяга|seated cable row|cable row/i, slug: "cable-row" },
  { pattern: /гантел.*наклон|dumbbell row|single-arm row/i, slug: "dumbbell-row" },
  { pattern: /молотк|hammer curl/i, slug: "hammer-curl" },
  { pattern: /сгибан.*штанг|barbell curl|biceps curl/i, slug: "barbell-curl" },
  { pattern: /жим ног|leg press/i, slug: "leg-press" },
  { pattern: /румынск|romanian deadlift|rdl/i, slug: "romanian-deadlift" },
  { pattern: /разгибан.*ног|leg extension/i, slug: "leg-extension" },
  { pattern: /сгибан.*ног|leg curl/i, slug: "leg-curl" },
  { pattern: /присед.*штанг|barbell.*squat|back squat/i, slug: "barbell-squat" },
  { pattern: /жим.*сидя|overhead|shoulder press|seated.*press/i, slug: "overhead-press" },
  { pattern: /мах.*наклон|rear delt/i, slug: "rear-delt-fly" },
  { pattern: /гравитрон|pull-up|подтягив|chin-up/i, slug: "pull-up" },
  { pattern: /узк|close.?grip|алмаз|diamond/i, slug: "close-grip-push-up" },
  { pattern: /pike|стойк.*стен|decline push/i, slug: "pike-push-up" },
  { pattern: /колен|knee push/i, slug: "knee-push-up" },
  { pattern: /стул|chair.*dip|triceps dip|обратн.*отжим/i, slug: "triceps-dip" },
  { pattern: /боков.*планк|side plank/i, slug: "side-plank" },
  { pattern: /обратн.*планк|reverse plank/i, slug: "reverse-plank" },
  { pattern: /скалолаз|mountain climber/i, slug: "mountain-climber" },
  { pattern: /велосипед|bicycle crunch/i, slug: "bicycle-crunch" },
  { pattern: /скручив|crunch/i, slug: "crunch" },
  { pattern: /стол|inverted row|австралий/i, slug: "inverted-row" },
  { pattern: /полотенц|towel|рюкзак|backpack|тяга.*пояс/i, slug: "hip-hinge" },
  { pattern: /v-up|лодочк|boat hold|hollow/i, slug: "hollow-body" },
  { pattern: /сумо|sumo/i, slug: "sumo-squat" },
  { pattern: /прыжк.*присед|squat jump|soft squat/i, slug: "squat-jump" },
  { pattern: /прыжк.*выпад|jumping lunge/i, slug: "squat-jump" },
  { pattern: /боков.*выпад|lateral lunge/i, slug: "lateral-lunge" },
  { pattern: /стен|wall sit/i, slug: "wall-sit" },
  { pattern: /носк|calf/i, slug: "calf-raise" },
  { pattern: /планк.*ног|leg raise/i, slug: "plank" },
  { pattern: /планк|plank/i, slug: "plank" },
  { pattern: /выпад|lunge/i, slug: "lunge" },
  { pattern: /присед|squat/i, slug: "squat" },
  { pattern: /бёрпи|burpee/i, slug: "burpee" },
  { pattern: /прыжк.*развед|jumping jack/i, slug: "jumping-jack" },
  { pattern: /высок.*колен|high knee/i, slug: "high-knees" },
  { pattern: /вращен|circle/i, slug: "shoulder-rotation" },
  { pattern: /мах|raise/i, slug: "arm-raise" },
  { pattern: /кошка|cat.?cow/i, slug: "cat-cow" },
  { pattern: /растяж|stretch|наклон/i, slug: "stretch" },
  { pattern: /птиц|bird/i, slug: "bird-dog" },
  { pattern: /мост|bridge/i, slug: "glute-bridge" },
  { pattern: /супермен|superman/i, slug: "superman" },
  { pattern: /отжим|push.?up/i, slug: "push-up" },
  { pattern: /жим|press/i, slug: "bench-press" },
  { pattern: /тяга|row/i, slug: "cable-row" },
  { pattern: /сгибан|curl/i, slug: "barbell-curl" },
];

export function illustrationSlugForExercise(name: string): IllustrationSlug {
  const key = normalizeExerciseName(name);
  if (EXACT_SLUG[key]) {
    return EXACT_SLUG[key];
  }
  const n = name.toLowerCase();
  for (const { pattern, slug } of PATTERNS) {
    if (pattern.test(n)) {
      return slug;
    }
  }
  return "generic-workout";
}

/** Путь на статику Mini App (тот же origin, что и webapp). */
export function illustrationAssetPath(name: string): string {
  const slug = illustrationSlugForExercise(name);
  return `/exercises/${slug}.svg`;
}
