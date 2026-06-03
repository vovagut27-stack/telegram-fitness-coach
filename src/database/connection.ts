/** Prefer Neon pooler host for serverless (Vercel). */
export function normalizeDatabaseUrl(raw: string): string {
  let url = raw.trim();
  if (!url) {
    return url;
  }

  if (url.includes("neon.tech") && !url.includes("-pooler")) {
    url = url.replace(/(ep-[^.@/]+)(\.[^/]*neon\.tech)/i, "$1-pooler$2");
  }

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "30");
    }
    if (!parsed.searchParams.has("sslmode") && !url.includes("localhost")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isLocalDatabase(url: string): boolean {
  return url.includes("localhost") || url.includes("127.0.0.1");
}

export function shouldUseNeonDriver(url: string): boolean {
  if (isLocalDatabase(url)) {
    return false;
  }
  return (
    url.includes("neon.tech") ||
    url.includes("neon.database") ||
    process.env.USE_NEON_DRIVER === "true"
  );
}
