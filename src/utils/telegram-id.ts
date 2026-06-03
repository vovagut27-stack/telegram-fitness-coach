/** Parse Telegram user id without float precision loss (uses bigint-safe string). */
export function parseTelegramId(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const s = String(raw).trim();
  if (!/^\d+$/.test(s)) {
    return null;
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
}

export function telegramIdParam(raw: unknown): string | null {
  const id = parseTelegramId(raw);
  return id ? String(id) : null;
}
