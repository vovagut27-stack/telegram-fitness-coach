import type { Context } from "telegraf";
import { t } from "../../i18n/index.js";
import { getUserStats } from "../../services/results-service.js";
import { buildMainKeyboard } from "../keyboards/main.js";
import { getUserLocale } from "./start.js";
import { ensureLanguageChosen } from "./language.js";

function weightTrendLine(
  locale: "ru" | "en",
  trend: "down" | "up" | "stable" | null,
  changeKg: number | null,
): string {
  if (!trend) {
    return locale === "ru" ? "нет замеров" : "no entries";
  }
  const kg = changeKg != null ? Math.abs(changeKg) : 0;
  if (trend === "down") {
    return locale === "ru" ? `↓ ${kg} кг` : `↓ ${kg} kg`;
  }
  if (trend === "up") {
    return locale === "ru" ? `↑ ${kg} кг` : `↑ ${kg} kg`;
  }
  return locale === "ru" ? "стабильно" : "stable";
}

export async function statsCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }
  if (!(await ensureLanguageChosen(ctx))) {
    return;
  }
  const locale = await getUserLocale(telegramId);

  try {
    const stats = await getUserStats(telegramId);
    const lines = [
      t(locale, "bot_stats_header"),
      "",
      t(locale, "bot_stats_streak", { n: String(stats.currentStreak) }),
      t(locale, "bot_stats_week", {
        done: String(stats.completedThisWeek),
        last: String(stats.completedLastWeek),
      }),
      t(locale, "bot_stats_sets", {
        sets: String(stats.totalSetsThisWeek),
        last: String(stats.totalSetsLastWeek),
      }),
    ];

    if (stats.latestWeight != null) {
      lines.push(
        t(locale, "bot_stats_weight", {
          kg: String(stats.latestWeight),
          trend: weightTrendLine(locale, stats.weightTrend, stats.weightChangeKg),
        }),
      );
    } else {
      lines.push(t(locale, "bot_stats_weight_none"));
    }

    lines.push("", t(locale, "bot_stats_footer"));

    await ctx.reply(lines.join("\n"), buildMainKeyboard(locale));
  } catch (err) {
    console.error("/stats failed:", err);
    await ctx.reply(t(locale, "bot_error_generic"), buildMainKeyboard(locale));
  }
}
