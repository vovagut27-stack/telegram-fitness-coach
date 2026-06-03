const DEFAULT_LOCAL = "http://localhost:3000/api";
/** Fallback if VITE_API_BASE_URL is not set on Vercel webapp build. */
const PRODUCTION_FALLBACK = "https://telegram-fitness-coach.vercel.app/api";

function normalizeApiBase(raw: string): string {
  const value = raw.trim().replace(/\/+$/, "");
  if (value.includes("<") || value.includes(">")) {
    return normalizeApiBase(PRODUCTION_FALLBACK);
  }
  if (!value.endsWith("/api")) {
    return `${value}/api`;
  }
  return value;
}

function fromEnv(): string | undefined {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!raw?.trim()) {
    return undefined;
  }
  if (raw.includes("localhost") && !import.meta.env.DEV) {
    return undefined;
  }
  return normalizeApiBase(raw);
}

function fromQuery(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const api = new URLSearchParams(window.location.search).get("api");
  if (api?.startsWith("http")) {
    return normalizeApiBase(api);
  }
  return undefined;
}

function productionFallback(): string {
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return normalizeApiBase(PRODUCTION_FALLBACK);
  }
  return normalizeApiBase(DEFAULT_LOCAL);
}

let resolvedBase = fromQuery() ?? fromEnv() ?? productionFallback();

export function getApiBase(): string {
  return resolvedBase;
}

export function setApiBase(url: string): void {
  resolvedBase = normalizeApiBase(url);
}

/** Load /app-config.json (editable without rebuild on static host). */
export async function loadApiConfig(): Promise<string> {
  const q = fromQuery();
  if (q) {
    resolvedBase = q;
    return resolvedBase;
  }

  const env = fromEnv();
  if (env) {
    resolvedBase = env;
    return resolvedBase;
  }

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}app-config.json`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { apiBase?: string };
      if (data.apiBase?.startsWith("http")) {
        resolvedBase = normalizeApiBase(data.apiBase);
        return resolvedBase;
      }
    }
  } catch {
    // ignore
  }

  resolvedBase = productionFallback();
  return resolvedBase;
}

export async function probeApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/health`, { cache: "no-store" });
    if (!res.ok) {
      return false;
    }
    const data = (await res.json()) as { ok?: boolean; database?: string };
    return Boolean(data.ok && data.database === "connected");
  } catch {
    return false;
  }
}
