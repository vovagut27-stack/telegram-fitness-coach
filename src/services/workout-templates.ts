import type { Locale } from "../types/locale.js";
import type { FitnessLevel, WorkoutExercise, WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { enrichExerciseImage, enrichWorkoutExercises } from "./exercise-images.js";

type MuscleFocus = "push" | "pull" | "legs";

type LocalizedExercise = {
  ru: Omit<WorkoutExercise, "name"> & { name: string };
  en: Omit<WorkoutExercise, "name"> & { name: string };
};

const POOLS: Record<MuscleFocus, Record<FitnessLevel, LocalizedExercise[]>> = {
  push: {
    beginner: [
      {
        ru: {
          name: "Отжимания от пола",
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          instructions: "Корпус прямой, локти под углом 45°.",
          equipment: "none",
        },
        en: {
          name: "Standard push-ups",
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          instructions: "Keep a straight line from head to heels.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Отжимания с колен",
          sets: 3,
          reps: "10-12",
          restSeconds: 45,
          instructions: "Упростите, если обычные отжимания тяжёлые.",
          equipment: "none",
        },
        en: {
          name: "Knee push-ups",
          sets: 3,
          reps: "10-12",
          restSeconds: 45,
          instructions: "Use these if full push-ups are too hard.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Обратные отжимания от стула",
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          instructions: "Ладони на краю стула, локти назад.",
          equipment: "chair",
        },
        en: {
          name: "Chair triceps dips",
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          instructions: "Hands on chair edge, elbows pointing back.",
          equipment: "chair",
        },
      },
      {
        ru: {
          name: "Планка",
          sets: 3,
          reps: "30-40 сек",
          restSeconds: 45,
          instructions: "Не прогибайте поясницу.",
          equipment: "none",
        },
        en: {
          name: "Plank hold",
          sets: 3,
          reps: "30-40 sec",
          restSeconds: 45,
          instructions: "Keep hips level, core tight.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Подъёмы рук в стороны (без веса)",
          sets: 3,
          reps: "12-15",
          restSeconds: 45,
          instructions: "Медленно вверх и вниз, плечи опущены.",
          equipment: "none",
        },
        en: {
          name: "Lateral arm raises",
          sets: 3,
          reps: "12-15",
          restSeconds: 45,
          instructions: "Controlled motion, shoulders relaxed.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Супермен для плеч",
          sets: 3,
          reps: "12",
          restSeconds: 45,
          instructions: "Лёжа на животе, поднимайте руки и грудь.",
          equipment: "none",
        },
        en: {
          name: "Prone Y-raises",
          sets: 3,
          reps: "12",
          restSeconds: 45,
          instructions: "Lie face down, lift arms in a Y shape.",
          equipment: "none",
        },
      },
    ],
    intermediate: [
      {
        ru: {
          name: "Отжимания узким хватом",
          sets: 4,
          reps: "8-12",
          restSeconds: 60,
          instructions: "Ладони уже плеч, акцент на трицепс.",
          equipment: "none",
        },
        en: {
          name: "Close-grip push-ups",
          sets: 4,
          reps: "8-12",
          restSeconds: 60,
          instructions: "Hands shoulder-width or narrower.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Отжимания ноги на возвышении",
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          instructions: "Ноги на стуле, корпус под углом.",
          equipment: "chair",
        },
        en: {
          name: "Decline push-ups",
          sets: 3,
          reps: "8-10",
          restSeconds: 60,
          instructions: "Feet elevated on a stable surface.",
          equipment: "chair",
        },
      },
      {
        ru: {
          name: "Алмазные отжимания",
          sets: 3,
          reps: "6-10",
          restSeconds: 75,
          instructions: "Большие пальцы и указательные соприкасаются.",
          equipment: "none",
        },
        en: {
          name: "Diamond push-ups",
          sets: 3,
          reps: "6-10",
          restSeconds: 75,
          instructions: "Hands form a diamond under your chest.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Планка с касанием плеча",
          sets: 3,
          reps: "16 (по 8)",
          restSeconds: 60,
          instructions: "Поочерёдно касайтесь противоположного плеча.",
          equipment: "none",
        },
        en: {
          name: "Plank shoulder taps",
          sets: 3,
          reps: "16 (8 each)",
          restSeconds: 60,
          instructions: "Alternate tapping opposite shoulders.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Отжимания «лучник»",
          sets: 3,
          reps: "6-8 на сторону",
          restSeconds: 75,
          instructions: "Смещайте вес на одну руку.",
          equipment: "none",
        },
        en: {
          name: "Archer push-ups",
          sets: 3,
          reps: "6-8 per side",
          restSeconds: 75,
          instructions: "Shift weight toward one arm each rep.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Бёрпи без прыжка",
          sets: 3,
          reps: "8",
          restSeconds: 90,
          instructions: "Присед — планка — отжимание — встать.",
          equipment: "none",
        },
        en: {
          name: "No-jump burpees",
          sets: 3,
          reps: "8",
          restSeconds: 90,
          instructions: "Squat, plank, push-up, stand up.",
          equipment: "none",
        },
      },
    ],
    advanced: [
      {
        ru: {
          name: "Отжимания с хлопком",
          sets: 4,
          reps: "5-8",
          restSeconds: 90,
          instructions: "Только если уверены в контроле приземления.",
          equipment: "none",
        },
        en: {
          name: "Clap push-ups",
          sets: 4,
          reps: "5-8",
          restSeconds: 90,
          instructions: "Only if you can land with control.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Отжимания в стойке у стены (pike)",
          sets: 3,
          reps: "6-10",
          restSeconds: 90,
          instructions: "Таз выше плеч, акцент на плечи.",
          equipment: "none",
        },
        en: {
          name: "Pike push-ups",
          sets: 3,
          reps: "6-10",
          restSeconds: 90,
          instructions: "Hips high, shoulders work harder.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Отжимания на одной руке (с опорой)",
          sets: 3,
          reps: "4-6 на сторону",
          restSeconds: 90,
          instructions: "Вторая нога в стороне для баланса.",
          equipment: "none",
        },
        en: {
          name: "Assisted one-arm push-ups",
          sets: 3,
          reps: "4-6 per side",
          restSeconds: 90,
          instructions: "Wide stance for balance.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Глубокие отжимания между стульями",
          sets: 3,
          reps: "8-10",
          restSeconds: 75,
          instructions: "Максимальная амплитуда, грудь ниже ладоней.",
          equipment: "chair",
        },
        en: {
          name: "Deep chair push-ups",
          sets: 3,
          reps: "8-10",
          restSeconds: 75,
          instructions: "Full range between two sturdy chairs.",
          equipment: "chair",
        },
      },
      {
        ru: {
          name: "Планка с подъёмом ног",
          sets: 3,
          reps: "10",
          restSeconds: 60,
          instructions: "Поочерёдно поднимайте прямые ноги.",
          equipment: "none",
        },
        en: {
          name: "Plank leg raises",
          sets: 3,
          reps: "10",
          restSeconds: 60,
          instructions: "Alternate straight leg lifts.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Бёрпи полные",
          sets: 4,
          reps: "10",
          restSeconds: 90,
          instructions: "С прыжком вверх в конце.",
          equipment: "none",
        },
        en: {
          name: "Full burpees",
          sets: 4,
          reps: "10",
          restSeconds: 90,
          instructions: "Include a jump at the top.",
          equipment: "none",
        },
      },
    ],
  },
  pull: {
    beginner: [
      {
        ru: {
          name: "Супермен",
          sets: 3,
          reps: "12",
          restSeconds: 45,
          instructions: "Поднимайте руки и ноги одновременно.",
          equipment: "none",
        },
        en: {
          name: "Superman hold",
          sets: 3,
          reps: "12",
          restSeconds: 45,
          instructions: "Lift arms and legs off the floor together.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Обратная планка",
          sets: 3,
          reps: "20-30 сек",
          restSeconds: 45,
          instructions: "Корпус прямой, пятки на полу.",
          equipment: "none",
        },
        en: {
          name: "Reverse plank",
          sets: 3,
          reps: "20-30 sec",
          restSeconds: 45,
          instructions: "Straight line from shoulders to heels.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Тяга полотенца к поясу",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Полотенце в дверном проёме, локти назад.",
          equipment: "towel",
        },
        en: {
          name: "Towel door rows",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Lean back, pull elbows to ribs.",
          equipment: "towel",
        },
      },
      {
        ru: {
          name: "Сгибания рук с полотенцем",
          sets: 3,
          reps: "12",
          restSeconds: 45,
          instructions: "Ноги на полотенце, сопротивление ногами.",
          equipment: "towel",
        },
        en: {
          name: "Towel biceps curls",
          sets: 3,
          reps: "12",
          restSeconds: 45,
          instructions: "Step on towel, curl against resistance.",
          equipment: "towel",
        },
      },
      {
        ru: {
          name: "Птица-собака",
          sets: 3,
          reps: "10 на сторону",
          restSeconds: 45,
          instructions: "На четвереньках, противоположная рука и нога.",
          equipment: "none",
        },
        en: {
          name: "Bird-dog",
          sets: 3,
          reps: "10 per side",
          restSeconds: 45,
          instructions: "On all fours, extend opposite arm and leg.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Скручивания на пресс",
          sets: 3,
          reps: "15",
          restSeconds: 45,
          instructions: "Подбородок не прижимайте к груди.",
          equipment: "none",
        },
        en: {
          name: "Crunches",
          sets: 3,
          reps: "15",
          restSeconds: 45,
          instructions: "Lift shoulder blades, not your neck.",
          equipment: "none",
        },
      },
    ],
    intermediate: [
      {
        ru: {
          name: "Австралийские подтягивания под столом",
          sets: 4,
          reps: "8-12",
          restSeconds: 75,
          instructions: "Грудь к краю стола, корпус прямой.",
          equipment: "table",
        },
        en: {
          name: "Inverted table rows",
          sets: 4,
          reps: "8-12",
          restSeconds: 75,
          instructions: "Pull chest to table edge.",
          equipment: "table",
        },
      },
      {
        ru: {
          name: "Пуловер с полотенцем",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Руки прямые, движение за голову и обратно.",
          equipment: "towel",
        },
        en: {
          name: "Towel pullovers",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Arms straight, arc behind head.",
          equipment: "towel",
        },
      },
      {
        ru: {
          name: "Обратные снежинки",
          sets: 3,
          reps: "15",
          restSeconds: 45,
          instructions: "Лёжа на животе, руки в стороны и вверх.",
          equipment: "none",
        },
        en: {
          name: "Prone reverse flies",
          sets: 3,
          reps: "15",
          restSeconds: 45,
          instructions: "Squeeze shoulder blades at the top.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Планка с греблей",
          sets: 3,
          reps: "12 на сторону",
          restSeconds: 60,
          instructions: "В планке подтягивайте локоть к ребру.",
          equipment: "none",
        },
        en: {
          name: "Plank rows",
          sets: 3,
          reps: "12 per side",
          restSeconds: 60,
          instructions: "In plank, pull elbow to rib cage.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Молитвенное сгибание с полотенцем",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Руки вдоль тела, сгибайте в локтях.",
          equipment: "towel",
        },
        en: {
          name: "Towel hammer curls",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Neutral grip, slow eccentric.",
          equipment: "towel",
        },
      },
      {
        ru: {
          name: "Велосипед для пресса",
          sets: 3,
          reps: "20",
          restSeconds: 45,
          instructions: "Локоть к противоположному колену.",
          equipment: "none",
        },
        en: {
          name: "Bicycle crunches",
          sets: 3,
          reps: "20",
          restSeconds: 45,
          instructions: "Elbow meets opposite knee.",
          equipment: "none",
        },
      },
    ],
    advanced: [
      {
        ru: {
          name: "Подтягивания (или негативы)",
          sets: 4,
          reps: "5-8",
          restSeconds: 120,
          instructions: "Медленно опускайтесь, если не тянетесь вверх.",
          equipment: "pull-up bar",
        },
        en: {
          name: "Pull-ups (or negatives)",
          sets: 4,
          reps: "5-8",
          restSeconds: 120,
          instructions: "Slow lowering if you cannot pull up yet.",
          equipment: "pull-up bar",
        },
      },
      {
        ru: {
          name: "Подтягивания обратным хватом",
          sets: 3,
          reps: "6-8",
          restSeconds: 90,
          instructions: "Акцент на бицепс и широчайшие.",
          equipment: "pull-up bar",
        },
        en: {
          name: "Chin-ups",
          sets: 3,
          reps: "6-8",
          restSeconds: 90,
          instructions: "Palms facing you.",
          equipment: "pull-up bar",
        },
      },
      {
        ru: {
          name: "Складной нож (V-up)",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Касайтесь носков руками в верхней точке.",
          equipment: "none",
        },
        en: {
          name: "V-ups",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Touch toes at the top.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Лодочка",
          sets: 3,
          reps: "30-40 сек",
          restSeconds: 60,
          instructions: "Держите ноги и корпус над полом.",
          equipment: "none",
        },
        en: {
          name: "Boat hold",
          sets: 3,
          reps: "30-40 sec",
          restSeconds: 60,
          instructions: "Balance on sit bones.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Тяга в наклоне с рюкзаком",
          sets: 4,
          reps: "10",
          restSeconds: 75,
          instructions: "Спина прямая, локти к корпусу.",
          equipment: "backpack",
        },
        en: {
          name: "Backpack bent-over rows",
          sets: 4,
          reps: "10",
          restSeconds: 75,
          instructions: "Flat back, pull to lower ribs.",
          equipment: "backpack",
        },
      },
      {
        ru: {
          name: "Скалолаз",
          sets: 4,
          reps: "30 сек",
          restSeconds: 60,
          instructions: "Быстрый темп, колени к груди.",
          equipment: "none",
        },
        en: {
          name: "Mountain climbers",
          sets: 4,
          reps: "30 sec",
          restSeconds: 60,
          instructions: "Fast knees, strong plank.",
          equipment: "none",
        },
      },
    ],
  },
  legs: {
    beginner: [
      {
        ru: {
          name: "Приседания",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
          instructions: "Колени по направлению носков.",
          equipment: "none",
        },
        en: {
          name: "Bodyweight squats",
          sets: 3,
          reps: "12-15",
          restSeconds: 60,
          instructions: "Knees track over toes.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Выпады назад",
          sets: 3,
          reps: "10 на ногу",
          restSeconds: 60,
          instructions: "Шаг назад, колено не касается пола.",
          equipment: "none",
        },
        en: {
          name: "Reverse lunges",
          sets: 3,
          reps: "10 per leg",
          restSeconds: 60,
          instructions: "Step back, knee hovers above floor.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Ягодичный мост",
          sets: 3,
          reps: "15",
          restSeconds: 45,
          instructions: "Вверху сожмите ягодицы на 1 сек.",
          equipment: "none",
        },
        en: {
          name: "Glute bridge",
          sets: 3,
          reps: "15",
          restSeconds: 45,
          instructions: "Squeeze glutes at the top.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Присед у стены",
          sets: 3,
          reps: "30-40 сек",
          restSeconds: 60,
          instructions: "Спина прижата к стене, бёдра параллельно полу.",
          equipment: "none",
        },
        en: {
          name: "Wall sit",
          sets: 3,
          reps: "30-40 sec",
          restSeconds: 60,
          instructions: "Back flat on wall, thighs parallel.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Подъёмы на носки",
          sets: 3,
          reps: "15-20",
          restSeconds: 45,
          instructions: "Медленно вверх и вниз.",
          equipment: "none",
        },
        en: {
          name: "Calf raises",
          sets: 3,
          reps: "15-20",
          restSeconds: 45,
          instructions: "Full range on the balls of your feet.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Боковая планка",
          sets: 2,
          reps: "20 сек на сторону",
          restSeconds: 45,
          instructions: "Корпус прямой, бёдра не провисают.",
          equipment: "none",
        },
        en: {
          name: "Side plank",
          sets: 2,
          reps: "20 sec per side",
          restSeconds: 45,
          instructions: "Straight line, hips lifted.",
          equipment: "none",
        },
      },
    ],
    intermediate: [
      {
        ru: {
          name: "Выпады вперёд",
          sets: 3,
          reps: "12 на ногу",
          restSeconds: 60,
          instructions: "Корпус вертикально.",
          equipment: "none",
        },
        en: {
          name: "Forward lunges",
          sets: 3,
          reps: "12 per leg",
          restSeconds: 60,
          instructions: "Torso upright throughout.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Присед «сумо»",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Широкая постановка ног, носки в стороны.",
          equipment: "none",
        },
        en: {
          name: "Sumo squats",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Wide stance, toes turned out.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Выпады в сторону",
          sets: 3,
          reps: "10 на сторону",
          restSeconds: 60,
          instructions: "Вес на пятке согнутой ноги.",
          equipment: "none",
        },
        en: {
          name: "Lateral lunges",
          sets: 3,
          reps: "10 per side",
          restSeconds: 60,
          instructions: "Sit back into the working hip.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Мостик на одной ноге",
          sets: 3,
          reps: "8 на ногу",
          restSeconds: 60,
          instructions: "Вторая нога вытянута вперёд.",
          equipment: "none",
        },
        en: {
          name: "Single-leg glute bridge",
          sets: 3,
          reps: "8 per leg",
          restSeconds: 60,
          instructions: "One leg extended, drive through heel.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Прыжковые приседания (мягко)",
          sets: 3,
          reps: "10",
          restSeconds: 75,
          instructions: "Мягкое приземление на носки.",
          equipment: "none",
        },
        en: {
          name: "Soft squat jumps",
          sets: 3,
          reps: "10",
          restSeconds: 75,
          instructions: "Land quietly through your feet.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Скручивания «велосипед»",
          sets: 3,
          reps: "20",
          restSeconds: 45,
          instructions: "Медленный контроль, не тяните шею.",
          equipment: "none",
        },
        en: {
          name: "Slow bicycle crunches",
          sets: 3,
          reps: "20",
          restSeconds: 45,
          instructions: "Controlled rotation.",
          equipment: "none",
        },
      },
    ],
    advanced: [
      {
        ru: {
          name: "Пистолетик (с опорой)",
          sets: 3,
          reps: "5 на ногу",
          restSeconds: 90,
          instructions: "Держитесь за стул для баланса.",
          equipment: "chair",
        },
        en: {
          name: "Assisted pistol squats",
          sets: 3,
          reps: "5 per leg",
          restSeconds: 90,
          instructions: "Hold a chair for balance.",
          equipment: "chair",
        },
      },
      {
        ru: {
          name: "Выпады с прыжком",
          sets: 3,
          reps: "8 на ногу",
          restSeconds: 90,
          instructions: "Переключайте ноги в воздухе.",
          equipment: "none",
        },
        en: {
          name: "Jumping lunges",
          sets: 3,
          reps: "8 per leg",
          restSeconds: 90,
          instructions: "Switch legs in the air.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Болгарские выпады",
          sets: 3,
          reps: "10 на ногу",
          restSeconds: 75,
          instructions: "Задняя нога на стуле.",
          equipment: "chair",
        },
        en: {
          name: "Bulgarian split squats",
          sets: 3,
          reps: "10 per leg",
          restSeconds: 75,
          instructions: "Rear foot elevated on chair.",
          equipment: "chair",
        },
      },
      {
        ru: {
          name: "Присед с рюкзаком",
          sets: 4,
          reps: "10",
          restSeconds: 90,
          instructions: "Рюкзак плотно к спине.",
          equipment: "backpack",
        },
        en: {
          name: "Backpack squats",
          sets: 4,
          reps: "10",
          restSeconds: 90,
          instructions: "Keep backpack tight to your back.",
          equipment: "backpack",
        },
      },
      {
        ru: {
          name: "Планка с разведением ног",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "В планке разводите ноги в стороны.",
          equipment: "none",
        },
        en: {
          name: "Plank jack feet",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          instructions: "Jump feet wide and back in plank.",
          equipment: "none",
        },
      },
      {
        ru: {
          name: "Скалолаз с поворотом",
          sets: 3,
          reps: "30 сек",
          restSeconds: 75,
          instructions: "Колено к противоположному локтю.",
          equipment: "none",
        },
        en: {
          name: "Cross-body mountain climbers",
          sets: 3,
          reps: "30 sec",
          restSeconds: 75,
          instructions: "Knee toward opposite elbow.",
          equipment: "none",
        },
      },
    ],
  },
};

const FOCUS_LABELS: Record<MuscleFocus, Record<Locale, string[]>> = {
  push: {
    ru: ["грудь", "трицепс", "плечи"],
    en: ["chest", "triceps", "shoulders"],
  },
  pull: {
    ru: ["спина", "бицепс"],
    en: ["back", "biceps"],
  },
  legs: {
    ru: ["ноги", "ягодицы", "пресс"],
    en: ["legs", "glutes", "core"],
  },
};

function muscleFocus(targetMuscles?: string[]): MuscleFocus {
  const joined = (targetMuscles ?? []).join(" ").toLowerCase();
  if (/back|biceps|спин|бицеп/.test(joined)) {
    return "pull";
  }
  if (/leg|glute|core|ног|ягод|пресс/.test(joined)) {
    return "legs";
  }
  return "push";
}

function exerciseCountForTime(timeMinutes: number): number {
  if (timeMinutes <= 20) {
    return 4;
  }
  if (timeMinutes <= 35) {
    return 5;
  }
  return 6;
}

function recentExerciseNames(lastWorkouts: WorkoutPlan[]): Set<string> {
  const names = new Set<string>();
  for (const workout of lastWorkouts.slice(0, 3)) {
    for (const ex of workout.exercises) {
      names.add(ex.name.toLowerCase());
    }
  }
  return names;
}

function localize(item: LocalizedExercise, locale: Locale): WorkoutExercise {
  return enrichExerciseImage(item[locale] ?? item.en);
}

function filterByEquipment(
  exercises: WorkoutExercise[],
  availableEquipment: string[],
): WorkoutExercise[] {
  const allowed = new Set(availableEquipment.map((e) => e.toLowerCase()));
  allowed.add("none");
  allowed.add("bodyweight");
  return exercises.filter((ex) => {
    const eq = ex.equipment.toLowerCase();
    if (eq === "none" || eq === "bodyweight") {
      return true;
    }
    return [...allowed].some((a) => eq.includes(a) || a.includes(eq));
  });
}

export function buildTemplateWorkout(request: WorkoutRequest): WorkoutPlan {
  const locale = request.language === "en" ? "en" : "ru";
  const focus = muscleFocus(request.targetMuscles);
  const level = request.fitnessLevel;
  const pool = POOLS[focus][level] ?? POOLS[focus].beginner;
  const count = exerciseCountForTime(request.timeMinutes);
  const recent = recentExerciseNames(request.lastWorkouts);

  let candidates = pool
    .map((item) => localize(item, locale))
    .filter((ex) => !recent.has(ex.name.toLowerCase()));

  if (candidates.length < count) {
    candidates = pool.map((item) => localize(item, locale));
  }

  candidates = filterByEquipment(candidates, request.availableEquipment);
  if (candidates.length < count) {
    candidates = pool.map((item) => localize(item, locale));
  }

  const exercises = candidates.slice(0, count);
  const perExerciseMinutes = Math.max(4, Math.round(request.timeMinutes / exercises.length));

  return {
    targetMuscles: FOCUS_LABELS[focus][locale],
    exercises,
    totalMinutes: perExerciseMinutes * exercises.length,
    difficultyLevel: level,
    notes:
      locale === "ru"
        ? "Разминка 3–5 мин, между подходами отдых по плану."
        : "Warm up 3–5 min, rest between sets as listed.",
  };
}

const MIN_EXERCISES = 4;

export function normalizeWorkoutPlan(plan: WorkoutPlan, request: WorkoutRequest): WorkoutPlan {
  const exercises = [...(plan.exercises ?? [])].filter((ex) => ex?.name?.trim());
  if (exercises.length >= MIN_EXERCISES) {
    return { ...plan, exercises: enrichWorkoutExercises(exercises.slice(0, 6)) };
  }

  const template = buildTemplateWorkout(request);
  const seen = new Set(exercises.map((e) => e.name.toLowerCase()));
  for (const ex of template.exercises) {
    if (exercises.length >= MIN_EXERCISES) {
      break;
    }
    if (!seen.has(ex.name.toLowerCase())) {
      exercises.push(ex);
      seen.add(ex.name.toLowerCase());
    }
  }

  return {
    ...plan,
    exercises: enrichWorkoutExercises(exercises),
    targetMuscles: plan.targetMuscles?.length ? plan.targetMuscles : template.targetMuscles,
    totalMinutes: plan.totalMinutes || template.totalMinutes,
    difficultyLevel: plan.difficultyLevel ?? request.fitnessLevel,
    notes: plan.notes ?? template.notes,
  };
}
