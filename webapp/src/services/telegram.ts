declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: { user?: { id?: number } };
        openInvoice?: (url: string, callback?: (status: string) => void) => void;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton?: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        themeParams?: Record<string, string>;
      };
    };
  }
}

export function getTelegramUserId(): number {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? 1;
}

export function initTelegramWebApp(): void {
  const tg = window.Telegram?.WebApp;
  tg?.ready?.();
  tg?.expand?.();
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
