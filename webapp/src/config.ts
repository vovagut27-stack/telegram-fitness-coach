function normalizeApiBase(raw: string | undefined): string {
  const value = (raw ?? "http://localhost:3000/api").trim().replace(/\/+$/, "");
  if (value.includes("<") || value.includes(">")) {
    throw new Error("Invalid VITE_API_BASE_URL: replace placeholder with your real backend URL.");
  }
  if (!value.endsWith("/api")) {
    return `${value}/api`;
  }
  return value;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL);
