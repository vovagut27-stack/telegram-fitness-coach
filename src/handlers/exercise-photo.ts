import type { Request, Response } from "express";
import { lookupExercisePhoto } from "../services/exercise-image-catalog.js";
import { resolveExerciseVisualUrl } from "../services/exercise-visual-catalog.js";
import type { Gender } from "../types/profile.js";

const ALLOWED_HOSTS = new Set(["images.unsplash.com"]);

function isProxyablePhotoUrl(url: string): boolean {
  if (url.startsWith("/")) {
    return false;
  }
  try {
    return ALLOWED_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

function parseGenderParam(value: unknown): Gender | null {
  if (value === "male" || value === "female") {
    return value;
  }
  return null;
}

export async function exercisePhotoHandler(req: Request, res: Response): Promise<void> {
  const name = String(req.query.name ?? "").trim();
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const gender = parseGenderParam(req.query.gender);
  const equipment = String(req.query.equipment ?? "").trim() || undefined;
  const catalogUrl = lookupExercisePhoto(name);
  const url =
    catalogUrl && isProxyablePhotoUrl(catalogUrl)
      ? catalogUrl
      : resolveExerciseVisualUrl(name, gender, equipment);

  if (!url || !isProxyablePhotoUrl(url)) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const parsed = new URL(url);

  try {
    const upstream = await fetch(url, {
      headers: { Accept: "image/*", "User-Agent": "FitBot/1.0" },
    });
    if (!upstream.ok) {
      res.status(502).json({ error: "upstream_failed" });
      return;
    }
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=600");
    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch {
    res.status(502).json({ error: "fetch_failed" });
  }
}
