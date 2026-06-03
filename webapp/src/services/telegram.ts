declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: { user?: { id?: number }; start_param?: string };
        openInvoice?: (url: string, callback?: (status: string) => void) => void;
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
  window.Telegram?.WebApp?.ready?.();
  window.Telegram?.WebApp?.expand?.();
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
