import { abortSignalTimeout } from "./utils/fetch-timeout";

const PRODUCTION_BACKEND = "https://telegram-fitness-coach.vercel.app/api";

function normalizeApiBase(raw: string): string {
  const value = raw.trim().replace(/\/+$/, "");

  if (value.startsWith("/")) {
    if (typeof window !== "undefined") {
      const path = value.endsWith("/api") ? value : `${value}/api`;
      return `${window.location.origin}${path}`;
    }
    return PRODUCTION_BACKEND;
  }

  if (value.includes("<") || value.includes(">")) {
    return resolveApiBase();
  }
  if (!value.endsWith("/api")) {
    return `${value}/api`;
  }
  return value;
}

/** Same domain as Mini App — Vercel rewrites /api → backend (no CORS). */
function sameOriginApi(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const { protocol, hostname } = window.location;
  if (protocol !== "http:" && protocol !== "https:") {
    return undefined;
  }
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${window.location.origin}/api`;
  }
  return `${window.location.origin}/api`;
}

function fromEnvDevOnly(): string | undefined {
  if (!import.meta.env.DEV) {
    return undefined;
  }
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!raw?.trim()) {
    return undefined;
  }
  return normalizeApiBase(raw);
}

function fromQuery(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const api = new URLSearchParams(window.location.search).get("api");
  if (api?.startsWith("http") || api?.startsWith("/")) {
    return normalizeApiBase(api);
  }
  return undefined;
}

function resolveApiBase(): string {
  return sameOriginApi() ?? normalizeApiBase(PRODUCTION_BACKEND);
}

let resolvedBase = fromQuery() ?? fromEnvDevOnly() ?? resolveApiBase();

export function getApiBase(): string {
  return resolvedBase;
}

export function setApiBase(url: string): void {
  resolvedBase = normalizeApiBase(url);
}

export async function loadApiConfig(): Promise<string> {
  const q = fromQuery();
  if (q) {
    resolvedBase = q;
    return resolvedBase;
  }

  const dev = fromEnvDevOnly();
  if (dev) {
    resolvedBase = dev;
    return resolvedBase;
  }

  const same = sameOriginApi();
  if (same) {
    // Production Mini App on Vercel: /api proxy — skip extra app-config round-trip.
    resolvedBase = same;
    return resolvedBase;
  }

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}app-config.json`, {
      cache: "force-cache",
    });
    if (res.ok) {
      const data = (await res.json()) as { apiBase?: string };
      if (data.apiBase) {
        resolvedBase = normalizeApiBase(data.apiBase);
      }
    }
  } catch {
    // ignore
  }

  if (!resolvedBase) {
    resolvedBase = resolveApiBase();
  }

  return resolvedBase;
}

export async function probeApiHealth(timeoutMs = 6000): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/health`, {
      cache: "no-store",
      signal: abortSignalTimeout(timeoutMs),
    });
    if (!res.ok) {
      return false;
    }
    const data = (await res.json()) as { ok?: boolean; database?: string };
    return Boolean(data.ok && data.database === "connected");
  } catch {
    return false;
  }
}
