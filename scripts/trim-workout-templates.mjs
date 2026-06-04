import fs from "node:fs";

const path = "src/services/workout-templates.ts";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
const header = `import type { Locale } from "../types/locale.js";
import type { Gender } from "../types/profile.js";
import type { FitnessLevel, WorkoutExercise, WorkoutPlan, WorkoutRequest } from "../types/workout.js";
import { getSplitForDate } from "./schedule-service.js";
import { enrichExerciseImage, enrichWorkoutExercises } from "./exercise-images.js";
import {
  HOME_CLASSIC_POOLS,
  HOME_FOCUS_LABELS,
  type MuscleFocus,
  type LocalizedExercise,
} from "./home-classic-pools.js";

const POOLS = HOME_CLASSIC_POOLS;
const FOCUS_LABELS: Record<MuscleFocus, Record<Locale, string[]>> = HOME_FOCUS_LABELS;
`;
const tail = lines.slice(1027).join("\n");
fs.writeFileSync(path, `${header}\n${tail}`);
console.log("done", header.split("\n").length + tail.split("\n").length);
