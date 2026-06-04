declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: { user?: { id?: number | string }; start_param?: string };
        openInvoice?: (url: string, callback?: (status: string) => void) => void;
        themeParams?: {
          bg_color?: string;
          secondary_bg_color?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

function parseUserId(raw: unknown): number | null {
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (typeof n === "number" && Number.isFinite(n) && n > 0) {
    return Math.floor(n);
  }
  return null;
}

function readUserIdFromInitData(initData: string): number | null {
  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get("user");
    if (!userJson) {
      return null;
    }
    const user = JSON.parse(userJson) as { id?: number | string };
    return parseUserId(user.id);
  } catch {
    return null;
  }
}

/** Real Telegram user id, or null if the app is opened outside Telegram. */
export function getTelegramUserId(): number | null {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    return null;
  }

  const fromUnsafe = parseUserId(tg.initDataUnsafe?.user?.id);
  if (fromUnsafe) {
    return fromUnsafe;
  }

  if (tg.initData) {
    return readUserIdFromInitData(tg.initData);
  }

  return null;
}

/** Wait until Telegram WebApp SDK exposes the user (opens inside Telegram). */
export function waitForTelegramUserId(timeoutMs = 8000): Promise<number | null> {
  const immediate = getTelegramUserId();
  if (immediate) {
    return Promise.resolve(immediate);
  }

  return new Promise((resolve) => {
    const started = Date.now();
    const tick = (): void => {
      const id = getTelegramUserId();
      if (id) {
        resolve(id);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

export function requireTelegramUserId(): number {
  const id = getTelegramUserId();
  if (!id) {
    throw new Error("TELEGRAM_USER_REQUIRED");
  }
  return id;
}

export function getWorkoutDateFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("date");
  if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) {
    return q;
  }
  const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  if (sp && /^\d{4}-\d{2}-\d{2}$/.test(sp)) {
    return sp;
  }
  return null;
}

export function initTelegramWebApp(): void {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    return;
  }
  tg.ready?.();
  tg.expand?.();
  const params = tg.themeParams;
  const bg = params?.bg_color ?? params?.secondary_bg_color;
  if (bg) {
    document.body.style.backgroundColor = bg;
    document.documentElement.style.setProperty("--tg-bg", bg);
  }
}

export function openStarsInvoice(url: string, onDone?: (paid: boolean) => void): void {
  const tg = window.Telegram?.WebApp;
  if (tg?.openInvoice) {
    tg.openInvoice(url, (status) => {
      onDone?.(status === "paid");
    });
    return;
  }
  window.open(url, "_blank");
  onDone?.(false);
}
