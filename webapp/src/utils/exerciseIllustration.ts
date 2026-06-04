/** Slug → local SVG under public/exercises (anatomical illustrations). */
const SLUG_PATTERN =
  /\/exercises\/([a-z0-9-]+)\.svg$/i;

export function isLocalExerciseIllustration(url: string): boolean {
  return url.startsWith("/exercises/") && url.endsWith(".svg");
}

export function resolveLocalExerciseAsset(url: string): string {
  if (!isLocalExerciseIllustration(url)) {
    return url;
  }
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const path = url.startsWith("/") ? url.slice(1) : url;
  return `${normalizedBase}${path}`;
}

export function illustrationSlugFromUrl(url: string): string | null {
  const m = url.match(SLUG_PATTERN);
  return m?.[1] ?? null;
}
