import type { Locale } from "../types/locale.js";
import type { WorkoutExercise } from "../types/workout.js";
import { normalizeExerciseName } from "./exercise-image-catalog.js";
import { GYM_READY_SPLITS } from "./gym-ready-splits.js";
import { HOME_READY_SPLITS, type LocalizedExercise } from "./home-ready-splits.js";

export type MuscleTag =
  | "chest"
  | "triceps"
  | "shoulders"
  | "back"
  | "biceps"
  | "legs"
  | "glutes"
  | "core"
  | "cardio"
  | "mobility"
  | "full_body";

export type CatalogMode = "home" | "gym";

export interface CatalogExercise {
  id: string;
  muscles: MuscleTag[];
  modes: CatalogMode[];
  ru: WorkoutExercise;
  en: WorkoutExercise;
}

/** Теги по русскому названию (нормализованному). */
const MUSCLE_TAGS: Record<string, MuscleTag[]> = {
  // Дом
  "выпады в ходьбе": ["legs"],
  "круговые движения руками": ["shoulders", "mobility"],
  "прыжки с разведением рук и ног": ["cardio", "full_body"],
  "бёрпи": ["cardio", "full_body"],
  "бег с высоким подниманием бедра": ["cardio", "legs"],
  "приседания у скамьи с собственным весом": ["legs"],
  "отжимания": ["chest", "triceps"],
  "приседания на корточках": ["legs"],
  "алмазные отжимания": ["triceps", "chest"],
  "передняя планка": ["core"],
  "растяжка сгибателей бедра стоя": ["legs", "mobility"],
  "прыжки конькобежца": ["legs", "cardio"],
  "ягодичный мостик на одной ноге": ["glutes", "legs"],
  "приседания с прыжком": ["legs", "cardio"],
  "модифицированное отжимание на предплечья": ["chest", "triceps", "core"],
  "вращение плечами": ["shoulders", "mobility"],
  "попеременные косые скручивания": ["core"],
  "негативный флаг дракона": ["core"],
  "тяга супермена": ["back", "core"],
  "планка «медведь»": ["core"],
  "боковая планка": ["core"],
  // Зал
  "жим штанги лежа": ["chest", "triceps"],
  "жим гантелей на наклонной скамье": ["chest", "shoulders"],
  "сведения рук в тренажере бабочка": ["chest"],
  "армейский жим штанги стоя": ["shoulders", "triceps"],
  "разведения гантелей в стороны": ["shoulders"],
  "тяга штанги к подбородку": ["shoulders", "back"],
  "выпады с гантелями": ["legs", "glutes"],
  "жим ногами в тренажёре сидя": ["legs"],
  "разгибание ног в рычажном тренажере": ["legs"],
  "жим носками сидя в рычажном тренажере": ["legs", "glutes"],
  "жим гантелей над головой стоя": ["shoulders", "triceps"],
};

function exerciseId(ruName: string): string {
  return normalizeExerciseName(ruName).replace(/\s+/g, "-");
}

function tagsFor(ruName: string): MuscleTag[] {
  return MUSCLE_TAGS[normalizeExerciseName(ruName)] ?? ["full_body"];
}

function addFromSplit(
  map: Map<string, CatalogExercise>,
  items: LocalizedExercise[],
  mode: CatalogMode,
): void {
  for (const item of items) {
    const key = exerciseId(item.ru.name);
    const existing = map.get(key);
    if (existing) {
      if (!existing.modes.includes(mode)) {
        existing.modes.push(mode);
      }
      continue;
    }
    map.set(key, {
      id: key,
      muscles: tagsFor(item.ru.name),
      modes: [mode],
      ru: item.ru,
      en: item.en,
    });
  }
}

function buildCatalog(): CatalogExercise[] {
  const map = new Map<string, CatalogExercise>();
  for (const day of HOME_READY_SPLITS) {
    addFromSplit(map, day.exercises, "home");
  }
  for (const day of GYM_READY_SPLITS) {
    addFromSplit(map, day.exercises, "gym");
  }
  return [...map.values()];
}

const ALL_CATALOG = buildCatalog();

export function getExerciseCatalog(mode: CatalogMode): CatalogExercise[] {
  return ALL_CATALOG.filter((e) => e.modes.includes(mode));
}

/** Целевые группы из расписания → теги каталога. */
export function targetMusclesToTags(targets: string[]): MuscleTag[] {
  const tags = new Set<MuscleTag>();
  for (const raw of targets) {
    const t = raw.toLowerCase();
    if (/chest|груд/.test(t)) {
      tags.add("chest");
    }
    if (/triceps|трицепс/.test(t)) {
      tags.add("triceps");
    }
    if (/shoulder|плеч|дельт/.test(t)) {
      tags.add("shoulders");
    }
    if (/back|спин|широч/.test(t)) {
      tags.add("back");
    }
    if (/biceps|бицепс/.test(t)) {
      tags.add("biceps");
    }
    if (/leg|ног|квадри|икрон/.test(t)) {
      tags.add("legs");
    }
    if (/glute|ягод/.test(t)) {
      tags.add("glutes");
    }
    if (/core|пресс|кор|abs|стабил/.test(t)) {
      tags.add("core");
    }
    if (/cardio|кардио|всё тело|full/.test(t)) {
      tags.add("cardio");
      tags.add("full_body");
    }
    if (/mobility|разминк|растяж/.test(t)) {
      tags.add("mobility");
    }
    if (/strength|сил/.test(t)) {
      tags.add("chest");
      tags.add("legs");
    }
  }
  if (tags.size === 0) {
    tags.add("full_body");
  }
  return [...tags];
}

export function exerciseMatchesTargets(
  exercise: CatalogExercise,
  targetTags: MuscleTag[],
): boolean {
  return exercise.muscles.some((m) => targetTags.includes(m));
}

export function filterCatalogByTargets(
  catalog: CatalogExercise[],
  targets: string[],
): CatalogExercise[] {
  const tags = targetMusclesToTags(targets);
  const matched = catalog.filter((e) => exerciseMatchesTargets(e, tags));
  if (matched.length >= 4) {
    return matched;
  }
  return catalog;
}

export function catalogEntryForAi(
  entry: CatalogExercise,
  locale: Locale,
): { id: string; name: string; muscles: MuscleTag[]; equipment: string; sets: number; reps: string } {
  const ex = locale === "en" ? entry.en : entry.ru;
  return {
    id: entry.id,
    name: ex.name,
    muscles: entry.muscles,
    equipment: ex.equipment,
    sets: ex.sets,
    reps: ex.reps,
  };
}

export function resolveCatalogExercises(
  ids: string[],
  mode: CatalogMode,
  locale: Locale,
): WorkoutExercise[] {
  const catalog = getExerciseCatalog(mode);
  const byId = new Map(catalog.map((e) => [e.id, e]));
  const out: WorkoutExercise[] = [];
  const seen = new Set<string>();

  for (const id of ids) {
    const key = id.trim().toLowerCase();
    const entry = byId.get(key);
    if (!entry || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(locale === "en" ? { ...entry.en } : { ...entry.ru });
  }
  return out;
}

export function gymDayKeyToTargets(dayKey: string): string[] {
  if (dayKey === "chest_shoulders") {
    return ["chest", "triceps", "shoulders"];
  }
  if (dayKey === "legs_shoulders") {
    return ["legs", "glutes", "shoulders"];
  }
  return ["full body"];
}

export function exerciseCountForMinutes(minutes: number, mode: CatalogMode): number {
  if (mode === "gym") {
    return minutes <= 30 ? 5 : minutes <= 45 ? 6 : 7;
  }
  if (minutes <= 25) {
    return 5;
  }
  if (minutes <= 40) {
    return 7;
  }
  return 9;
}
