import type { MessageKey } from "../i18n";

const EQUIPMENT_KEYS: Record<string, MessageKey> = {
  none: "equipment_none",
  bodyweight: "equipment_bodyweight",
  home: "equipment_bodyweight",
  chair: "equipment_chair",
  barbell: "equipment_barbell",
  dumbbell: "equipment_dumbbell",
  cable: "equipment_cable",
  machine: "equipment_machine",
  leg_press: "equipment_leg_press",
  gym: "equipment_gym",
};

export function equipmentMessageKey(raw: string): MessageKey {
  const key = raw.toLowerCase().trim();
  if (EQUIPMENT_KEYS[key]) {
    return EQUIPMENT_KEYS[key];
  }
  if (key.includes("barbell") || key.includes("штанг")) {
    return "equipment_barbell";
  }
  if (key.includes("dumbbell") || key.includes("гантел")) {
    return "equipment_dumbbell";
  }
  if (key.includes("cable") || key.includes("блок") || key.includes("кросс")) {
    return "equipment_cable";
  }
  if (key.includes("machine") || key.includes("тренаж") || key.includes("гравитрон")) {
    return "equipment_machine";
  }
  if (key.includes("leg") && key.includes("press")) {
    return "equipment_leg_press";
  }
  return "equipment_gym";
}

export function equipmentIcon(raw: string): string {
  const key = raw.toLowerCase();
  if (key.includes("barbell") || key === "barbell") {
    return "🏋️";
  }
  if (key.includes("dumbbell")) {
    return "💪";
  }
  if (key.includes("cable") || key.includes("блок")) {
    return "🔗";
  }
  if (key.includes("machine") || key.includes("press") || key.includes("тренаж")) {
    return "⚙️";
  }
  if (key === "none" || key === "bodyweight") {
    return "🧘";
  }
  return "🏋️";
}
