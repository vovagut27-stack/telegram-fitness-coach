/** Публичные ассеты упражнений (только фото в /exercises/photos/). */
export function resolveExerciseAssetUrl(url: string): string {
  if (!url.startsWith("/exercises/")) {
    return url;
  }
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const path = url.startsWith("/") ? url.slice(1) : url;
  return `${normalizedBase}${path}`;
}
