declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: { user?: { id?: number } };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export function getTelegramUserId(): number {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? 1;
}

export function initTelegramWebApp(): void {
  window.Telegram?.WebApp?.ready?.();
  window.Telegram?.WebApp?.expand?.();
}
