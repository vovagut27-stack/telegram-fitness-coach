import type { Request, Response } from "express";
import { lookupExercisePhoto } from "../services/exercise-image-catalog.js";
import { resolveExerciseVisualUrl } from "../services/exercise-visual-catalog.js";
import type { Gender } from "../types/profile.js";

const ALLOWED_HOSTS = new Set(["images.unsplash.com"]);

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
  const url =
    lookupExercisePhoto(name) ?? resolveExerciseVisualUrl(name, gender, equipment);

  if (!url) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).json({ error: "invalid_url" });
    return;
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    res.status(400).json({ error: "invalid_source" });
    return;
  }

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
    res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch {
    res.status(502).json({ error: "fetch_failed" });
  }
}
