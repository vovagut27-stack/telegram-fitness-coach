/** Локальные кадры (webapp/public/exercises/photos). */
const LOCAL_PHOTO = (file: string): string => `/exercises/photos/${file}`;

const PHOTO_BENCH_REF = LOCAL_PHOTO("barbell-bench-press.png");
const PHOTO_INCLINE_BARBELL_REF = LOCAL_PHOTO("incline-barbell-press.png");
const PHOTO_CHEST_FLY_REF = LOCAL_PHOTO("dumbbell-chest-fly.png");
const PHOTO_PULLUPS_REF = LOCAL_PHOTO("pull-ups.png");

/** Отдельные кадры для домашних ног / кардио (без generic gym photo). */
const PHOTO_SQUAT =
  "https://images.unsplash.com/photo-1649887974297-4be052375a67?w=640&q=80&auto=format&fit=crop";
const PHOTO_REVERSE_LUNGE =
  "https://images.unsplash.com/photo-1576678927481-e4c07d32309a?w=640&q=80&auto=format&fit=crop";
const PHOTO_FORWARD_LUNGE =
  "https://images.unsplash.com/photo-1609899517237-77d357b047cf?w=640&q=80&auto=format&fit=crop";
const PHOTO_GLUTE_BRIDGE =
  "https://images.unsplash.com/photo-1599904490399-5514912ea3a5?w=640&q=80&auto=format&fit=crop";
const PHOTO_BURPEE =
  "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80&auto=format&fit=crop";
const PHOTO_HIGH_KNEES =
  "https://images.unsplash.com/photo-1486218119243-138835b8b8038?w=640&q=80&auto=format&fit=crop";
const PHOTO_SIDE_PLANK =
  "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80&auto=format&fit=crop";
const PHOTO_FORWARD_FOLD =
  "https://images.unsplash.com/photo-1506126613408-07c117e81c1c?w=640&q=80&auto=format&fit=crop";
const PHOTO_CAT_COW =
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=640&q=80&auto=format&fit=crop";
const PHOTO_TRICEPS =
  "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=720&q=80&auto=format&fit=crop";
const PHOTO_ROW =
  "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=720&q=80&auto=format&fit=crop";
const PHOTO_LEG_PRESS =
  "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=720&q=80&auto=format&fit=crop";
const PHOTO_RDL =
  "https://images.unsplash.com/photo-1517960413843-0aee8e012128?w=720&q=80&auto=format&fit=crop";
const PHOTO_SHOULDER =
  "https://images.unsplash.com/photo-1583454111551-3ef18f1c3b0e?w=720&q=80&auto=format&fit=crop";

/** Exact exercise name → photo URL (ru + en). */
export const EXERCISE_PHOTOS: Record<string, string> = {
  // Push / chest / triceps (home)
  "отжимания от пола": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "standard push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "отжимания с колен": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80&auto=format&fit=crop",
  "knee push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80&auto=format&fit=crop",
  "обратные отжимания от стула": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  "chair triceps dips": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  "подъёмы рук в стороны (без веса)": "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=640&q=80",
  "lateral arm raises": "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=640&q=80",
  "супермен для плеч": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  "prone y-raises": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80",
  "отжимания узким хватом": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "close-grip push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "отжимания ноги на возвышении": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "decline push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "алмазные отжимания": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "diamond push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "планка с касанием плеча": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "plank shoulder taps": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "отжимания «лучник»": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "archer push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "бёрпи без прыжка": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  "no-jump burpees": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  "отжимания с хлопком": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "clap push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "отжимания в стойке у стены (pike)": "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=640&q=80",
  "pike push-ups": "https://images.unsplash.com/photo-1583500178690-f7d403a27cde?w=640&q=80",
  "отжимания на одной руке (с опорой)": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "assisted one-arm push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "глубокие отжимания между стульями": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "deep chair push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "планка с подъёмом ног": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "plank leg raises": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "бёрпи полные": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  "full burpees": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  // Pull / back
  "супермен":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80&auto=format&fit=crop",
  "superman hold":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80&auto=format&fit=crop",
  "вращения плечами":
    "https://images.unsplash.com/photo-1583454111551-3ef18f1c3b0e?w=640&q=80&auto=format&fit=crop",
  "shoulder circles":
    "https://images.unsplash.com/photo-1583454111551-3ef18f1c3b0e?w=640&q=80&auto=format&fit=crop",
  "растяжка плеч":
    "https://images.unsplash.com/photo-1506126613408-07c117e81c1c?w=640&q=80&auto=format&fit=crop",
  "shoulder stretch":
    "https://images.unsplash.com/photo-1506126613408-07c117e81c1c?w=640&q=80&auto=format&fit=crop",
  "прыжки с разведением рук":
    "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80&auto=format&fit=crop",
  "jumping jacks":
    "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80&auto=format&fit=crop",
  "птица-собака":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bird-dog_pose.jpg/640px-Bird-dog_pose.jpg",
  "bird-dog":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bird-dog_pose.jpg/640px-Bird-dog_pose.jpg",
  "обратная планка": PHOTO_SIDE_PLANK,
  "reverse plank": PHOTO_SIDE_PLANK,
  "тяга полотенца к поясу": "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  "towel door rows": "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  "сгибания рук с полотенцем": "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=640&q=80",
  "towel biceps curls": "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=640&q=80",
  "скручивания на пресс": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "crunches": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "австралийские подтягивания под столом": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "inverted table rows": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "пуловер с полотенцем": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "towel pullovers": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "обратные снежинки": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "prone reverse flies": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "планка с греблей": "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  "plank rows": "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  "молитвенное сгибание с полотенцем": "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=640&q=80",
  "towel hammer curls": "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=640&q=80",
  "велосипед для пресса": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "bicycle crunches": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "подтягивания (или негативы)": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "pull-ups (or negatives)": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "подтягивания обратным хватом": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "chin-ups": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80",
  "складной нож (v-up)": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "v-ups": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "лодочка": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "boat hold": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "тяга в наклоне с рюкзаком": "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  "backpack bent-over rows": "https://images.unsplash.com/photo-1603287681839-a1fac9b573b4?w=640&q=80",
  "скалолаз": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  "mountain climbers": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  // Legs
  "приседания": PHOTO_SQUAT,
  "bodyweight squats": PHOTO_SQUAT,
  "выпады назад": PHOTO_REVERSE_LUNGE,
  "reverse lunges": PHOTO_REVERSE_LUNGE,
  "ягодичный мост": PHOTO_GLUTE_BRIDGE,
  "glute bridge": PHOTO_GLUTE_BRIDGE,
  "бёрпи": PHOTO_BURPEE,
  "burpees": PHOTO_BURPEE,
  "бег с высоким подниманием колена": PHOTO_HIGH_KNEES,
  "high knees": PHOTO_HIGH_KNEES,
  "растяжка «кошка-корова»": PHOTO_CAT_COW,
  "cat-cow stretch": PHOTO_CAT_COW,
  "наклон вперёд стоя": PHOTO_FORWARD_FOLD,
  "standing forward fold": PHOTO_FORWARD_FOLD,
  "присед у стены": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "wall sit": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "подъёмы на носки": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "calf raises": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "боковая планка": PHOTO_SIDE_PLANK,
  "side plank": PHOTO_SIDE_PLANK,
  "выпады вперёд": PHOTO_FORWARD_LUNGE,
  "forward lunges": PHOTO_FORWARD_LUNGE,
  "присед «сумо»": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "sumo squats": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "выпады в сторону": PHOTO_FORWARD_LUNGE,
  "lateral lunges": PHOTO_FORWARD_LUNGE,
  "мостик на одной ноге": PHOTO_GLUTE_BRIDGE,
  "single-leg glute bridge": PHOTO_GLUTE_BRIDGE,
  "прыжковые приседания (мягко)": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "soft squat jumps": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "скручивания «велосипед»": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "slow bicycle crunches": "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "пистолетик (с опорой)": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "assisted pistol squats": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "выпады с прыжком": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  "jumping lunges": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  // Дом — готовые тренировки
  "выпады в ходьбе": PHOTO_FORWARD_LUNGE,
  "walking lunges": PHOTO_FORWARD_LUNGE,
  "круговые движения руками":
    "https://images.unsplash.com/photo-1583454111551-3ef18f1c3b0e?w=640&q=80&auto=format&fit=crop",
  "arm circles":
    "https://images.unsplash.com/photo-1583454111551-3ef18f1c3b0e?w=640&q=80&auto=format&fit=crop",
  "прыжки с разведением рук и ног":
    "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80&auto=format&fit=crop",
  "бег с высоким подниманием бедра": PHOTO_HIGH_KNEES,
  "приседания у скамьи с собственным весом": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "bench bodyweight squats": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "отжимания": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "push-ups": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=640&q=80",
  "приседания на корточках": PHOTO_SQUAT,
  "deep squats": PHOTO_SQUAT,
  "передняя планка": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "front plank": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "растяжка сгибателей бедра стоя": PHOTO_FORWARD_FOLD,
  "standing hip flexor stretch": PHOTO_FORWARD_FOLD,
  "прыжки конькобежца": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  "skater jumps": "https://images.unsplash.com/photo-1476480862126-209bfaa8ebaa?w=640&q=80",
  "ягодичный мостик на одной ноге": PHOTO_GLUTE_BRIDGE,
  "приседания с прыжком": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "jump squats": "https://images.unsplash.com/photo-1434682881908-b5d6e698fe2d?w=640&q=80",
  "модифицированное отжимание на предплечья":
    "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "modified forearm push-up":
    "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "вращение плечами":
    "https://images.unsplash.com/photo-1583454111551-3ef18f1c3b0e?w=640&q=80&auto=format&fit=crop",
  "shoulder rotations":
    "https://images.unsplash.com/photo-1583454111551-3ef18f1c3b0e?w=640&q=80&auto=format&fit=crop",
  "попеременные косые скручивания":
    "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "alternating bicycle crunches":
    "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "негативный флаг дракона":
    "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "negative dragon flag":
    "https://images.unsplash.com/photo-1571019614242-c5c993715daa?w=640&q=80",
  "тяга супермена":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80&auto=format&fit=crop",
  "superman pull":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=80&auto=format&fit=crop",
  "планка «медведь»": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  "bear plank": "https://images.unsplash.com/photo-1567598508481-65985588e295?w=640&q=80",
  // Gym — готовые тренировки
  "жим штанги лёжа": PHOTO_BENCH_REF,
  "жим штанги лежа": PHOTO_BENCH_REF,
  "barbell bench press": PHOTO_BENCH_REF,
  "жим гантелей на наклонной скамье": PHOTO_INCLINE_BARBELL_REF,
  "incline dumbbell press": PHOTO_INCLINE_BARBELL_REF,
  "сведения рук в тренажере бабочка": PHOTO_CHEST_FLY_REF,
  "pec deck machine": PHOTO_CHEST_FLY_REF,
  "армейский жим штанги стоя": PHOTO_SHOULDER,
  "standing barbell press": PHOTO_SHOULDER,
  "разведения гантелей в стороны": PHOTO_SHOULDER,
  "dumbbell lateral raise": PHOTO_SHOULDER,
  "тяга штанги к подбородку": PHOTO_ROW,
  "barbell upright row": PHOTO_ROW,
  "выпады с гантелями": PHOTO_FORWARD_LUNGE,
  "dumbbell lunges": PHOTO_FORWARD_LUNGE,
  "жим ногами в тренажёре сидя": PHOTO_LEG_PRESS,
  "seated leg press": PHOTO_LEG_PRESS,
  "разгибание ног в рычажном тренажере": PHOTO_LEG_PRESS,
  "lever leg extension": PHOTO_LEG_PRESS,
  "жим носками сидя в рычажном тренажере": PHOTO_SQUAT,
  "seated calf press": PHOTO_SQUAT,
  "жим гантелей над головой стоя": PHOTO_SHOULDER,
  "standing overhead dumbbell press": PHOTO_SHOULDER,
  "жим штанги в наклоне": PHOTO_INCLINE_BARBELL_REF,
  "incline barbell press": PHOTO_INCLINE_BARBELL_REF,
  "разводка гантелей лежа": PHOTO_CHEST_FLY_REF,
  "dumbbell chest fly": PHOTO_CHEST_FLY_REF,
  "подтягивания": PHOTO_PULLUPS_REF,
  "pull-ups": PHOTO_PULLUPS_REF,
  "жим гантелей на наклонной": PHOTO_INCLINE_BARBELL_REF,
  "разводка гантелей": PHOTO_CHEST_FLY_REF,
  "dumbbell flyes": PHOTO_CHEST_FLY_REF,
  "подтягивания / гравитрон": PHOTO_PULLUPS_REF,
  "pull-ups / assisted": PHOTO_PULLUPS_REF,
  "тяга верхнего блока": PHOTO_ROW,
  "lat pulldown": PHOTO_ROW,
  "тяга гантели в наклоне": PHOTO_ROW,
  "single-arm dumbbell row": PHOTO_ROW,
  "тяга горизонтальная": PHOTO_ROW,
  "seated cable row": PHOTO_ROW,
  "сгибание штанги": PHOTO_TRICEPS,
  "barbell curl": PHOTO_TRICEPS,
  "присед со штангой": PHOTO_SQUAT,
  "barbell back squat": PHOTO_SQUAT,
  "жим ногами": PHOTO_LEG_PRESS,
  "leg press": PHOTO_LEG_PRESS,
  "румынская тяга": PHOTO_RDL,
  "romanian deadlift": PHOTO_RDL,
  "разгибание ног": PHOTO_LEG_PRESS,
  "leg extension": PHOTO_LEG_PRESS,
  "сгибание ног": PHOTO_LEG_PRESS,
  "leg curl": PHOTO_LEG_PRESS,
  "подъём на носки стоя": PHOTO_SQUAT,
  "standing calf raise": PHOTO_SQUAT,
  "жим гантелей сидя": PHOTO_SHOULDER,
  "seated dumbbell press": PHOTO_SHOULDER,
  "махи в стороны": PHOTO_SHOULDER,
  "lateral raises": PHOTO_SHOULDER,
  "махи в наклоне": PHOTO_SHOULDER,
  "rear delt fly": PHOTO_SHOULDER,
  "французский жим": PHOTO_TRICEPS,
  "skull crushers": PHOTO_TRICEPS,
  "молотковые сгибания":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=720&q=80&auto=format&fit=crop",
  "hammer curls":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=720&q=80&auto=format&fit=crop",
};

export function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function lookupExercisePhoto(name: string): string | undefined {
  return EXERCISE_PHOTOS[normalizeExerciseName(name)];
}
