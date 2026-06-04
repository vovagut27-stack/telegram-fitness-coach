import fs from "node:fs";
import path from "node:path";
import { buildExtraExercises } from "./exercise-svg-extra.mjs";

const outDir = path.join("webapp", "public", "exercises");
fs.mkdirSync(outDir, { recursive: true });

const W = 400;
const H = 248;

function svgWrap(slug, title, body) {
  const p = slug.replace(/[^a-z0-9-]/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="${p}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#dbeafe"/>
      <stop offset="45%" stop-color="#ecfdf5"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="${p}-card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="${p}-muscle" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#e11d48"/>
    </radialGradient>
    <filter id="${p}-shadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#64748b" flood-opacity="0.25"/>
    </filter>
    <filter id="${p}-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="${p}-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 Z" fill="#10b981"/>
    </marker>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${p}-bg)" rx="16"/>
  <circle cx="48" cy="42" r="52" fill="#93c5fd" opacity="0.12"/>
  <circle cx="${W - 40}" cy="${H - 30}" r="64" fill="#6ee7b7" opacity="0.14"/>
  <text x="${W / 2}" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#0f172a">${title}</text>
  ${body}
</svg>`;
}

function frame(labels = ["1", "2"]) {
  return `
  <text x="100" y="42" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="600" fill="#64748b">${labels[0]}</text>
  <text x="300" y="42" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="600" fill="#64748b">${labels[1]}</text>
  <path d="M ${W / 2 - 28} 128 L ${W / 2 + 18} 128" stroke="#10b981" stroke-width="3" marker-end="url(#arrow-fix)"/>
  <path d="M ${W / 2 - 28} 128 L ${W / 2 + 18} 128" stroke="#10b981" stroke-width="3"/>`;
}

function card(x, inner, slug) {
  const p = slug.replace(/[^a-z0-9-]/g, "");
  return `
  <g transform="translate(${x}, 48)">
    <rect x="0" y="0" width="168" height="178" rx="14" fill="url(#${p}-card)" filter="url(#${p}-shadow)" stroke="#e2e8f0" stroke-width="1"/>
    ${inner}
  </g>`;
}

function floor(y = 168) {
  return `<line x1="12" y1="${y}" x2="156" y2="${y}" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>`;
}

function joint(x, y) {
  return `<circle cx="${x}" cy="${y}" r="4.5" fill="#475569"/>`;
}

function limb(x1, y1, x2, y2, w = 9) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#body-fix)" stroke-width="${w}" stroke-linecap="round"/>`;
}

/** Build figure inside a card (origin 0,0; center ~84) */
function fig(parts, slug) {
  const p = slug.replace(/[^a-z0-9-]/g, "");
  const limbs = (parts.limbs ?? [])
    .map((l) => {
      const j1 = joint(l.x1, l.y1);
      const j2 = joint(l.x2, l.y2);
      return `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="url(#${p}-body)" stroke-width="${l.w ?? 9}" stroke-linecap="round"/>${j1}${j2}`;
    })
    .join("");
  const muscles = (parts.muscles ?? [])
    .map(
      (m) =>
        `<ellipse cx="${m.cx}" cy="${m.cy}" rx="${m.rx}" ry="${m.ry}" fill="url(#${p}-muscle)" opacity="0.88" filter="url(#${p}-glow)" transform="rotate(${m.rot ?? 0} ${m.cx} ${m.cy})"/>`,
    )
    .join("");
  return `
    ${parts.extras ?? ""}
    ${limbs}
    ${parts.torso ?? ""}
    <circle cx="${parts.head.cx}" cy="${parts.head.cy}" r="${parts.head.r ?? 11}" fill="url(#${p}-body)" stroke="#64748b" stroke-width="1"/>
    ${muscles}`;
}

function dual(slug, left, right, labels) {
  const p = slug.replace(/[^a-z0-9-]/g, "");
  const lbl = labels ?? ["старт", "финиш"];
  return `
  <text x="100" y="42" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="600" fill="#64748b">${lbl[0]}</text>
  <text x="300" y="42" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="600" fill="#64748b">${lbl[1]}</text>
  <path d="M 188 132 L 212 132" stroke="#10b981" stroke-width="3" marker-end="url(#${p}-arrow)"/>
  ${card(16, left, slug)}
  ${card(216, right, slug)}`;
}

function single(slug, inner) {
  return card(116, inner, slug);
}

const exercises = {
  "push-up": (slug) =>
    svgWrap(
      slug,
      "Push-up / Отжимания",
      dual(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 52 },
            torso: `<path d="M72 64 L76 92 L92 92 L96 64 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 72, y1: 70, x2: 42, y2: 92, w: 8 },
              { x1: 96, y1: 70, x2: 126, y2: 92, w: 8 },
              { x1: 76, y1: 92, x2: 58, y2: 132, w: 10 },
              { x1: 92, y1: 92, x2: 110, y2: 132, w: 10 },
              { x1: 58, y1: 132, x2: 44, y2: 168, w: 9 },
              { x1: 110, y1: 132, x2: 124, y2: 168, w: 9 },
            ],
            muscles: [
              { cx: 84, cy: 78, rx: 24, ry: 11 },
              { cx: 50, cy: 95, rx: 9, ry: 15, rot: -22 },
              { cx: 118, cy: 95, rx: 9, ry: 15, rot: 22 },
            ],
          },
          slug,
        ),
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 68 },
            torso: `<path d="M72 80 L76 108 L92 108 L96 80 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 72, y1: 86, x2: 42, y2: 108, w: 8 },
              { x1: 96, y1: 86, x2: 126, y2: 108, w: 8 },
              { x1: 76, y1: 108, x2: 58, y2: 148, w: 10 },
              { x1: 92, y1: 108, x2: 110, y2: 148, w: 10 },
              { x1: 58, y1: 148, x2: 44, y2: 168, w: 9 },
              { x1: 110, y1: 148, x2: 124, y2: 168, w: 9 },
            ],
            muscles: [
              { cx: 84, cy: 94, rx: 26, ry: 12 },
              { cx: 50, cy: 112, rx: 10, ry: 16, rot: -18 },
              { cx: 118, cy: 112, rx: 10, ry: 16, rot: 18 },
            ],
          },
          slug,
        ),
      ),
    ),

  "knee-push-up": (slug) =>
    svgWrap(
      slug,
      "Knee push-up / С колен",
      single(
        slug,
        fig(
          {
            extras: `${floor(168)}<text x="84" y="28" text-anchor="middle" font-size="9" fill="#64748b">колени · knees</text>`,
            head: { cx: 84, cy: 78 },
            torso: `<path d="M72 90 L76 118 L92 118 L96 90 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 72, y1: 96, x2: 42, y2: 118, w: 8 },
              { x1: 96, y1: 96, x2: 126, y2: 118, w: 8 },
              { x1: 76, y1: 118, x2: 60, y2: 138, w: 10 },
              { x1: 92, y1: 118, x2: 108, y2: 138, w: 10 },
              { x1: 60, y1: 138, x2: 50, y2: 168, w: 9 },
              { x1: 108, y1: 138, x2: 118, y2: 168, w: 9 },
            ],
            muscles: [
              { cx: 84, cy: 106, rx: 22, ry: 10 },
              { cx: 48, cy: 120, rx: 9, ry: 14, rot: -15 },
              { cx: 120, cy: 120, rx: 9, ry: 14, rot: 15 },
            ],
          },
          slug,
        ),
      ),
    ),

  plank: (slug) =>
    svgWrap(
      slug,
      "Plank / Планка",
      single(
        slug,
        fig(
          {
            extras: floor(138),
            head: { cx: 32, cy: 118 },
            torso: `<path d="M32 128 L130 128 L130 144 L32 144 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 32, y1: 118, x2: 22, y2: 136, w: 8 },
              { x1: 130, y1: 136, x2: 152, y2: 140, w: 10 },
              { x1: 130, y1: 136, x2: 152, y2: 168, w: 10 },
            ],
            muscles: [{ cx: 82, cy: 136, rx: 42, ry: 14 }],
          },
          slug,
        ),
      ),
    ),

  "side-plank": (slug) =>
    svgWrap(
      slug,
      "Side plank / Боковая",
      single(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 100, cy: 62 },
            torso: `<path d="M94 74 L94 128 L106 128 L106 74 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 94, y1: 82, x2: 68, y2: 102, w: 9 },
              { x1: 100, y1: 128, x2: 132, y2: 152, w: 10 },
              { x1: 100, y1: 128, x2: 96, y2: 168, w: 9 },
            ],
            muscles: [{ cx: 100, cy: 102, rx: 12, ry: 30 }],
          },
          slug,
        ),
      ),
    ),

  squat: (slug) =>
    svgWrap(
      slug,
      "Squat / Присед",
      dual(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 38 },
            torso: `<path d="M72 50 L76 82 L92 82 L96 50 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 72, y1: 56, x2: 54, y2: 68, w: 8 },
              { x1: 96, y1: 56, x2: 114, y2: 68, w: 8 },
              { x1: 76, y1: 82, x2: 64, y2: 128, w: 11 },
              { x1: 92, y1: 82, x2: 104, y2: 128, w: 11 },
              { x1: 64, y1: 128, x2: 60, y2: 168, w: 10 },
              { x1: 104, y1: 128, x2: 108, y2: 168, w: 10 },
            ],
            muscles: [
              { cx: 84, cy: 66, rx: 18, ry: 14 },
              { cx: 66, cy: 112, rx: 13, ry: 18, rot: -6 },
              { cx: 102, cy: 112, rx: 13, ry: 18, rot: 6 },
            ],
          },
          slug,
        ),
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 52 },
            torso: `<path d="M70 64 L72 98 L94 98 L96 64 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 70, y1: 70, x2: 50, y2: 84, w: 8 },
              { x1: 96, y1: 70, x2: 118, y2: 84, w: 8 },
              { x1: 72, y1: 98, x2: 56, y2: 138, w: 11 },
              { x1: 94, y1: 98, x2: 112, y2: 138, w: 11 },
              { x1: 56, y1: 138, x2: 52, y2: 168, w: 10 },
              { x1: 112, y1: 138, x2: 116, y2: 168, w: 10 },
            ],
            muscles: [
              { cx: 84, cy: 82, rx: 22, ry: 16 },
              { cx: 58, cy: 128, rx: 15, ry: 18 },
              { cx: 110, cy: 128, rx: 15, ry: 18 },
            ],
          },
          slug,
        ),
        ["вверх", "вниз"],
      ),
    ),

  lunge: (slug) =>
    svgWrap(
      slug,
      "Lunge / Выпад",
      dual(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 32 },
            torso: `<path d="M74 44 L78 78 L90 78 L94 44 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 74, y1: 50, x2: 56, y2: 62, w: 8 },
              { x1: 94, y1: 50, x2: 112, y2: 62, w: 8 },
              { x1: 78, y1: 78, x2: 62, y2: 128, w: 10 },
              { x1: 90, y1: 78, x2: 112, y2: 148, w: 10 },
              { x1: 62, y1: 128, x2: 58, y2: 168, w: 9 },
              { x1: 112, y1: 148, x2: 118, y2: 168, w: 9 },
            ],
            muscles: [
              { cx: 104, cy: 118, rx: 15, ry: 22 },
              { cx: 64, cy: 135, rx: 12, ry: 17 },
            ],
          },
          slug,
        ),
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 32 },
            torso: `<path d="M74 44 L78 78 L90 78 L94 44 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 74, y1: 50, x2: 56, y2: 62, w: 8 },
              { x1: 94, y1: 50, x2: 112, y2: 62, w: 8 },
              { x1: 78, y1: 78, x2: 56, y2: 148, w: 10 },
              { x1: 90, y1: 78, x2: 106, y2: 128, w: 10 },
              { x1: 56, y1: 148, x2: 52, y2: 168, w: 9 },
              { x1: 106, y1: 128, x2: 102, y2: 168, w: 9 },
            ],
            muscles: [
              { cx: 58, cy: 118, rx: 15, ry: 22 },
              { cx: 104, cy: 135, rx: 12, ry: 17 },
            ],
          },
          slug,
        ),
        ["право", "лево"],
      ),
    ),

  burpee: (slug) =>
    svgWrap(
      slug,
      "Burpee / Бёрпи",
      dual(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 102 },
            torso: `<path d="M74 112 L78 138 L90 138 L94 112 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 74, y1: 108, x2: 84, y2: 58, w: 9 },
              { x1: 94, y1: 108, x2: 84, y2: 58, w: 9 },
              { x1: 78, y1: 138, x2: 64, y2: 168, w: 10 },
              { x1: 90, y1: 138, x2: 104, y2: 168, w: 10 },
            ],
            muscles: [{ cx: 84, cy: 75, rx: 16, ry: 12 }],
          },
          slug,
        ),
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 42 },
            torso: `<path d="M74 54 L78 86 L90 86 L94 54 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 74, y1: 60, x2: 54, y2: 74, w: 8 },
              { x1: 94, y1: 60, x2: 114, y2: 74, w: 8 },
              { x1: 78, y1: 86, x2: 64, y2: 136, w: 10 },
              { x1: 90, y1: 86, x2: 104, y2: 136, w: 10 },
              { x1: 64, y1: 136, x2: 60, y2: 168, w: 9 },
              { x1: 104, y1: 136, x2: 108, y2: 168, w: 9 },
            ],
            muscles: [
              { cx: 84, cy: 70, rx: 20, ry: 12 },
              { cx: 66, cy: 118, rx: 13, ry: 17 },
              { cx: 102, cy: 118, rx: 13, ry: 17 },
            ],
          },
          slug,
        ),
        ["присед", "прыжок"],
      ),
    ),

  "jumping-jack": (slug) =>
    svgWrap(
      slug,
      "Jumping jack",
      dual(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 42 },
            torso: `<path d="M74 54 L78 88 L90 88 L94 54 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 58, x2: 66, y2: 70, w: 7 },
              { x1: 90, y1: 58, x2: 102, y2: 70, w: 7 },
              { x1: 66, y1: 70, x2: 52, y2: 58, w: 6 },
              { x1: 102, y1: 70, x2: 116, y2: 58, w: 6 },
              { x1: 78, y1: 88, x2: 72, y2: 138, w: 9 },
              { x1: 90, y1: 88, x2: 96, y2: 138, w: 9 },
              { x1: 72, y1: 138, x2: 68, y2: 168, w: 8 },
              { x1: 96, y1: 138, x2: 100, y2: 168, w: 8 },
            ],
            muscles: [
              { cx: 50, cy: 64, rx: 9, ry: 13, rot: -28 },
              { cx: 118, cy: 64, rx: 9, ry: 13, rot: 28 },
            ],
          },
          slug,
        ),
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 42 },
            torso: `<path d="M74 54 L78 88 L90 88 L94 54 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 58, x2: 46, y2: 36, w: 8 },
              { x1: 90, y1: 58, x2: 122, y2: 36, w: 8 },
              { x1: 78, y1: 88, x2: 64, y2: 138, w: 9 },
              { x1: 90, y1: 88, x2: 104, y2: 138, w: 9 },
              { x1: 64, y1: 138, x2: 58, y2: 168, w: 8 },
              { x1: 104, y1: 138, x2: 110, y2: 168, w: 8 },
            ],
            muscles: [
              { cx: 40, cy: 42, rx: 10, ry: 15, rot: -38 },
              { cx: 128, cy: 42, rx: 10, ry: 15, rot: 38 },
              { cx: 84, cy: 64, rx: 18, ry: 10 },
            ],
          },
          slug,
        ),
      ),
    ),

  "high-knees": (slug) =>
    svgWrap(
      slug,
      "High knees",
      dual(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 46 },
            torso: `<path d="M74 58 L78 96 L90 96 L94 58 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 64, x2: 60, y2: 76, w: 7 },
              { x1: 90, y1: 64, x2: 108, y2: 76, w: 7 },
              { x1: 78, y1: 96, x2: 72, y2: 142, w: 9 },
              { x1: 90, y1: 96, x2: 110, y2: 72, w: 9 },
              { x1: 72, y1: 142, x2: 68, y2: 168, w: 8 },
              { x1: 110, y1: 72, x2: 114, y2: 98, w: 8 },
            ],
            muscles: [{ cx: 112, cy: 80, rx: 11, ry: 17, rot: 12 }],
          },
          slug,
        ),
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 46 },
            torso: `<path d="M74 58 L78 96 L90 96 L94 58 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 64, x2: 60, y2: 76, w: 7 },
              { x1: 90, y1: 64, x2: 108, y2: 76, w: 7 },
              { x1: 90, y1: 96, x2: 96, y2: 142, w: 9 },
              { x1: 78, y1: 96, x2: 58, y2: 72, w: 9 },
              { x1: 96, y1: 142, x2: 100, y2: 168, w: 8 },
              { x1: 58, y1: 72, x2: 54, y2: 98, w: 8 },
            ],
            muscles: [{ cx: 52, cy: 80, rx: 11, ry: 17, rot: -12 }],
          },
          slug,
        ),
      ),
    ),

  "shoulder-rotation": (slug) =>
    svgWrap(
      slug,
      "Shoulder circles",
      single(
        slug,
        `${floor(168)}<path d="M36 88 Q84 48 132 88" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="6 5"/>` +
          fig(
            {
              head: { cx: 84, cy: 52 },
              torso: `<path d="M74 64 L78 118 L90 118 L94 64 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
              limbs: [
                { x1: 78, y1: 70, x2: 50, y2: 86, w: 8 },
                { x1: 90, y1: 70, x2: 118, y2: 86, w: 8 },
                { x1: 78, y1: 118, x2: 72, y2: 162, w: 9 },
                { x1: 90, y1: 118, x2: 96, y2: 162, w: 9 },
              ],
              muscles: [{ cx: 84, cy: 78, rx: 26, ry: 11 }],
            },
            slug,
          ),
      ),
    ),

  "arm-raise": (slug) =>
    svgWrap(
      slug,
      "Arm raise",
      dual(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 46 },
            torso: `<path d="M74 58 L78 102 L90 102 L94 58 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 64, x2: 64, y2: 78, w: 7 },
              { x1: 90, y1: 64, x2: 104, y2: 78, w: 7 },
              { x1: 64, y1: 78, x2: 60, y2: 112, w: 6 },
              { x1: 104, y1: 78, x2: 108, y2: 112, w: 6 },
              { x1: 78, y1: 102, x2: 72, y2: 162, w: 9 },
              { x1: 90, y1: 102, x2: 96, y2: 162, w: 9 },
            ],
            muscles: [
              { cx: 58, cy: 102, rx: 9, ry: 15, rot: -8 },
              { cx: 110, cy: 102, rx: 9, ry: 15, rot: 8 },
            ],
          },
          slug,
        ),
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 46 },
            torso: `<path d="M74 58 L78 102 L90 102 L94 58 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 64, x2: 46, y2: 40, w: 8 },
              { x1: 90, y1: 64, x2: 122, y2: 40, w: 8 },
              { x1: 78, y1: 102, x2: 72, y2: 162, w: 9 },
              { x1: 90, y1: 102, x2: 96, y2: 162, w: 9 },
            ],
            muscles: [
              { cx: 42, cy: 44, rx: 10, ry: 15, rot: -32 },
              { cx: 126, cy: 44, rx: 10, ry: 15, rot: 32 },
              { cx: 84, cy: 74, rx: 22, ry: 10 },
            ],
          },
          slug,
        ),
        ["вниз", "вверх"],
      ),
    ),

  stretch: (slug) =>
    svgWrap(
      slug,
      "Stretch",
      single(
        slug,
        fig(
          {
            extras: floor(168),
            head: { cx: 84, cy: 62 },
            torso: `<path d="M76 74 L78 128 L90 128 L92 74 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 80, x2: 56, y2: 100, w: 7 },
              { x1: 90, y1: 80, x2: 112, y2: 100, w: 7 },
              { x1: 78, y1: 128, x2: 76, y2: 162, w: 9 },
              { x1: 90, y1: 128, x2: 92, y2: 162, w: 9 },
            ],
            muscles: [{ cx: 84, cy: 118, rx: 28, ry: 11 }],
          },
          slug,
        ),
      ),
    ),

  "cat-cow": (slug) =>
    svgWrap(
      slug,
      "Cat-cow",
      dual(
        slug,
        fig(
          {
            extras: floor(138),
            head: { cx: 32, cy: 108 },
            torso: `<path d="M32 118 L122 120 L122 136 L32 132 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 122, y1: 128, x2: 148, y2: 142, w: 8 },
              { x1: 122, y1: 128, x2: 148, y2: 162, w: 8 },
            ],
            muscles: [{ cx: 78, cy: 122, rx: 38, ry: 9 }],
          },
          slug,
        ),
        fig(
          {
            extras: floor(132),
            head: { cx: 32, cy: 100 },
            torso: `<path d="M32 110 L122 126 L122 142 L32 124 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 122, y1: 134, x2: 148, y2: 148, w: 8 },
              { x1: 122, y1: 134, x2: 148, y2: 168, w: 8 },
            ],
            muscles: [{ cx: 78, cy: 132, rx: 38, ry: 9 }],
          },
          slug,
        ),
        ["корова", "кошка"],
      ),
    ),

  "bird-dog": (slug) =>
    svgWrap(
      slug,
      "Bird-dog",
      single(
        slug,
        fig(
          {
            extras: floor(138),
            head: { cx: 32, cy: 112 },
            torso: `<path d="M32 122 L122 124 L122 140 L32 136 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 122, y1: 132, x2: 148, y2: 146, w: 8 },
              { x1: 122, y1: 132, x2: 148, y2: 166, w: 8 },
              { x1: 122, y1: 128, x2: 152, y2: 82, w: 7 },
              { x1: 122, y1: 128, x2: 48, y2: 90, w: 7 },
            ],
            muscles: [
              { cx: 156, cy: 84, rx: 11, ry: 15, rot: 22 },
              { cx: 44, cy: 92, rx: 11, ry: 15, rot: -22 },
            ],
          },
          slug,
        ),
      ),
    ),

  "glute-bridge": (slug) =>
    svgWrap(
      slug,
      "Glute bridge",
      dual(
        slug,
        fig(
          {
            extras: floor(148),
            head: { cx: 32, cy: 122 },
            torso: `<path d="M32 132 L108 134 L108 148 L32 144 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 108, y1: 140, x2: 134, y2: 152, w: 9 },
              { x1: 108, y1: 140, x2: 134, y2: 168, w: 9 },
            ],
            muscles: [{ cx: 72, cy: 138, rx: 14, ry: 9 }],
          },
          slug,
        ),
        fig(
          {
            extras: floor(148),
            head: { cx: 32, cy: 114 },
            torso: `<path d="M32 124 L108 108 L108 122 L32 136 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 108, y1: 115, x2: 134, y2: 142, w: 9 },
              { x1: 108, y1: 115, x2: 134, y2: 168, w: 9 },
            ],
            muscles: [
              { cx: 76, cy: 122, rx: 30, ry: 15 },
              { cx: 126, cy: 148, rx: 11, ry: 11 },
            ],
          },
          slug,
        ),
        ["низ", "мост"],
      ),
    ),

  superman: (slug) =>
    svgWrap(
      slug,
      "Superman",
      single(
        slug,
        fig(
          {
            extras: floor(162),
            head: { cx: 84, cy: 102 },
            torso: `<path d="M74 112 L78 132 L90 132 L94 112 Z" fill="url(#${slug.replace(/[^a-z0-9-]/g, "")}-body)"/>`,
            limbs: [
              { x1: 78, y1: 108, x2: 78, y2: 58, w: 9 },
              { x1: 78, y1: 116, x2: 48, y2: 132, w: 8 },
              { x1: 90, y1: 116, x2: 120, y2: 132, w: 8 },
              { x1: 48, y1: 132, x2: 36, y2: 156, w: 7 },
              { x1: 120, y1: 132, x2: 132, y2: 156, w: 7 },
              { x1: 78, y1: 132, x2: 72, y2: 162, w: 9 },
              { x1: 90, y1: 132, x2: 96, y2: 162, w: 9 },
            ],
            muscles: [
              { cx: 84, cy: 82, rx: 18, ry: 11 },
              { cx: 38, cy: 58, rx: 9, ry: 13, rot: -24 },
              { cx: 130, cy: 58, rx: 9, ry: 13, rot: 24 },
              { cx: 36, cy: 156, rx: 10, ry: 13 },
              { cx: 132, cy: 156, rx: 10, ry: 13 },
            ],
          },
          slug,
        ),
      ),
    ),
};

const ctx = { svgWrap, dual, single, fig, floor, card };
const allExercises = { ...exercises, ...buildExtraExercises(ctx) };

for (const [slug, build] of Object.entries(allExercises)) {
  const file = path.join(outDir, `${slug}.svg`);
  fs.writeFileSync(file, build(slug));
  console.log("wrote", file);
}
