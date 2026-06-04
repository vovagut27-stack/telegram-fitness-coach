export interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: { user?: { id?: number | string }; start_param?: string };
  platform?: string;
  themeParams?: {
    bg_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
  };
  openInvoice?: (url: string, callback?: (status: string) => void) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
  reload?: () => void;
  requestFullscreen?: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
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

/** Некоторые клиенты (часть mobile) кладут init data в hash. */
function readUserIdFromLocationHash(): number | null {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) {
    return null;
  }
  try {
    const params = new URLSearchParams(raw);
    const tgData = params.get("tgWebAppData");
    if (tgData) {
      return readUserIdFromInitData(decodeURIComponent(tgData));
    }
  } catch {
    // ignore
  }
  return null;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function isInsideTelegram(): boolean {
  return Boolean(getTelegramWebApp());
}

export function isTelegramMobile(): boolean {
  const platform = getTelegramWebApp()?.platform?.toLowerCase() ?? "";
  return platform === "ios" || platform === "android";
}

/** Real Telegram user id, or null if the app is opened outside Telegram. */
export function getTelegramUserId(): number | null {
  const tg = getTelegramWebApp();
  if (!tg) {
    return null;
  }

  const fromUnsafe = parseUserId(tg.initDataUnsafe?.user?.id);
  if (fromUnsafe) {
    return fromUnsafe;
  }

  if (tg.initData) {
    const fromInit = readUserIdFromInitData(tg.initData);
    if (fromInit) {
      return fromInit;
    }
  }

  return readUserIdFromLocationHash();
}

let cachedTelegramUserId: number | null | undefined;

/** User id resolved during initTelegramWebApp (avoids second 12s wait in App). */
export function getCachedTelegramUserId(): number | null {
  if (cachedTelegramUserId !== undefined) {
    return cachedTelegramUserId;
  }
  return getTelegramUserId();
}

/** Wait until Telegram WebApp SDK is injected (mobile can be slower than desktop). */
export function waitForTelegramWebApp(timeoutMs = 5000): Promise<TelegramWebApp | null> {
  const immediate = getTelegramWebApp();
  if (immediate) {
    return Promise.resolve(immediate);
  }

  return new Promise((resolve) => {
    const started = Date.now();
    const tick = (): void => {
      const tg = getTelegramWebApp();
      if (tg) {
        resolve(tg);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 25);
    };
    tick();
  });
}

/** Wait until Telegram WebApp SDK exposes the user (opens inside Telegram). */
export async function waitForTelegramUserId(timeoutMs = 4000): Promise<number | null> {
  const cached = getCachedTelegramUserId();
  if (cached) {
    return cached;
  }

  await waitForTelegramWebApp(timeoutMs);

  const immediate = getTelegramUserId();
  if (immediate) {
    cachedTelegramUserId = immediate;
    return immediate;
  }

  return new Promise((resolve) => {
    const started = Date.now();
    const tick = (): void => {
      const id = getTelegramUserId();
      if (id) {
        cachedTelegramUserId = id;
        resolve(id);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        cachedTelegramUserId = null;
        resolve(null);
        return;
      }
      window.setTimeout(tick, 30);
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
  const sp = getTelegramWebApp()?.initDataUnsafe?.start_param;
  if (sp && /^\d{4}-\d{2}-\d{2}$/.test(sp)) {
    return sp;
  }
  return null;
}

function applyTelegramTheme(tg: TelegramWebApp): void {
  const params = tg.themeParams;
  const bg = params?.bg_color ?? params?.secondary_bg_color;
  const header = params?.header_bg_color ?? bg;
  if (bg) {
    document.body.style.backgroundColor = bg;
    document.documentElement.style.setProperty("--tg-bg", bg);
    document.documentElement.style.setProperty("--bg", bg);
  }
  if (header && typeof tg.setHeaderColor === "function") {
    try {
      tg.setHeaderColor(header);
    } catch {
      // ignore
    }
  }
  if (bg && typeof tg.setBackgroundColor === "function") {
    try {
      tg.setBackgroundColor(bg);
    } catch {
      // ignore
    }
  }
}

function applyMobileLayout(tg: TelegramWebApp): void {
  document.documentElement.classList.add("telegram-webapp");
  if (isTelegramMobile()) {
    document.documentElement.classList.add("telegram-mobile");
  }

  tg.expand?.();

  // Only on phones: lets the page scroll inside the Mini App instead of closing it.
  // On Desktop (mouse wheel) this API is unnecessary and can interfere with scrolling.
  if (isTelegramMobile() && typeof tg.disableVerticalSwipes === "function") {
    try {
      tg.disableVerticalSwipes();
    } catch {
      // older clients
    }
  }

  if (isTelegramMobile() && typeof tg.requestFullscreen === "function") {
    const runFullscreen = (): void => {
      try {
        tg.requestFullscreen?.();
      } catch {
        // optional Bot API 8+
      }
    };
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(runFullscreen, { timeout: 800 });
    } else {
      window.setTimeout(runFullscreen, 120);
    }
  }
}

/** Call once at boot — same Mini App shell on Desktop / iOS / Android. */
export async function initTelegramWebApp(): Promise<void> {
  const tg = await waitForTelegramWebApp();
  if (!tg) {
    cachedTelegramUserId = getTelegramUserId();
    return;
  }

  tg.ready?.();
  cachedTelegramUserId = getTelegramUserId();
  applyTelegramTheme(tg);
  applyMobileLayout(tg);
}

export function openStarsInvoice(url: string, onDone?: (paid: boolean) => void): void {
  const tg = getTelegramWebApp();
  if (tg?.openInvoice) {
    tg.openInvoice(url, (status) => {
      onDone?.(status === "paid");
    });
    return;
  }
  window.open(url, "_blank");
  onDone?.(false);
}

export function reloadMiniApp(): void {
  const tg = getTelegramWebApp();
  if (typeof tg?.reload === "function") {
    tg.reload();
    return;
  }
  window.location.reload();
}
