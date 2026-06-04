import fs from "node:fs";
import path from "node:path";

const outDir = path.join("webapp", "public", "exercises");
fs.mkdirSync(outDir, { recursive: true });

const W = 360;
const H = 220;

function svgWrap(title, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#eef2f7"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d1d9e6"/>
      <stop offset="100%" stop-color="#a8b4c4"/>
    </linearGradient>
    <linearGradient id="muscle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff7043"/>
      <stop offset="100%" stop-color="#d32f2f"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#94a3b8" flood-opacity="0.35"/>
    </filter>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <line x1="${W / 2}" y1="12" x2="${W / 2}" y2="${H - 12}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4"/>
  ${body}
</svg>`;
}

function frame(labels = ["старт", "финиш"]) {
  return `
  <text x="90" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#64748b">${labels[0]}</text>
  <text x="270" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="#64748b">${labels[1]}</text>
  <path d="M ${W / 2 - 20} 112 L ${W / 2 + 14} 112" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arrow)"/>`;
}

function panel(x, inner) {
  return `<g transform="translate(${x}, 24)" filter="url(#soft)">${inner}</g>`;
}

function floor(y = 168) {
  return `<line x1="8" y1="${y}" x2="152" y2="${y}" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>`;
}

/** Anatomical stick figure builder (coords relative to panel origin 0,0; panel width ~160) */
function fig(parts) {
  const { head, torso, limbs = [], muscles = [], extras = "" } = parts;
  const limbPaths = limbs
    .map(
      (l) =>
        `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#5d6b7a" stroke-width="${l.w ?? 8}" stroke-linecap="round"/>`,
    )
    .join("");
  const musclePaths = muscles
    .map(
      (m) =>
        `<ellipse cx="${m.cx}" cy="${m.cy}" rx="${m.rx}" ry="${m.ry}" fill="url(#muscle)" transform="rotate(${m.rot ?? 0} ${m.cx} ${m.cy})"/>`,
    )
    .join("");
  return `
    ${extras}
    ${limbPaths}
    ${torso ?? ""}
    <circle cx="${head.cx}" cy="${head.cy}" r="${head.r ?? 10}" fill="url(#skin)" stroke="#5d6b7a" stroke-width="1.5"/>
    ${musclePaths}`;
}

function dual(left, right, labels) {
  return frame(labels) + panel(8, left) + panel(188, right);
}

const exercises = {
  "push-up": () =>
    svgWrap(
      "Push-up",
      dual(
        fig({
          head: { cx: 80, cy: 42 },
          torso: `<path d="M68 52 L72 78 L88 78 L92 52 Z" fill="url(#skin)" stroke="#5d6b7a" stroke-width="1.2"/>`,
          limbs: [
            { x1: 68, y1: 58, x2: 38, y2: 78, w: 7 },
            { x1: 92, y1: 58, x2: 122, y2: 78, w: 7 },
            { x1: 72, y1: 78, x2: 55, y2: 118, w: 9 },
            { x1: 88, y1: 78, x2: 105, y2: 118, w: 9 },
            { x1: 55, y1: 118, x2: 42, y2: 155, w: 8 },
            { x1: 105, y1: 118, x2: 118, y2: 155, w: 8 },
          ],
          muscles: [
            { cx: 80, cy: 68, rx: 22, ry: 10 },
            { cx: 48, cy: 82, rx: 8, ry: 14, rot: -25 },
            { cx: 112, cy: 82, rx: 8, ry: 14, rot: 25 },
          ],
        }),
        fig({
          head: { cx: 80, cy: 58 },
          torso: `<path d="M68 68 L72 94 L88 94 L92 68 Z" fill="url(#skin)" stroke="#5d6b7a" stroke-width="1.2"/>`,
          limbs: [
            { x1: 68, y1: 74, x2: 38, y2: 94, w: 7 },
            { x1: 92, y1: 74, x2: 122, y2: 94, w: 7 },
            { x1: 72, y1: 94, x2: 55, y2: 134, w: 9 },
            { x1: 88, y1: 94, x2: 105, y2: 134, w: 9 },
            { x1: 55, y1: 134, x2: 42, y2: 158, w: 8 },
            { x1: 105, y1: 134, x2: 118, y2: 158, w: 8 },
          ],
          muscles: [
            { cx: 80, cy: 84, rx: 24, ry: 11 },
            { cx: 48, cy: 98, rx: 9, ry: 15, rot: -20 },
            { cx: 112, cy: 98, rx: 9, ry: 15, rot: 20 },
          ],
        }),
      ),
    ),

  "knee-push-up": () =>
    svgWrap(
      "Knee push-up",
      panel(
        100,
        fig({
          extras: `${floor(150)}<text x="80" y="24" text-anchor="middle" font-size="10" fill="#64748b">колени на полу</text>`,
          head: { cx: 80, cy: 72 },
          torso: `<path d="M68 82 L72 108 L88 108 L92 82 Z" fill="url(#skin)" stroke="#5d6b7a" stroke-width="1.2"/>`,
          limbs: [
            { x1: 68, y1: 88, x2: 40, y2: 108, w: 7 },
            { x1: 92, y1: 88, x2: 120, y2: 108, w: 7 },
            { x1: 72, y1: 108, x2: 58, y2: 128, w: 9 },
            { x1: 88, y1: 108, x2: 102, y2: 128, w: 9 },
            { x1: 58, y1: 128, x2: 48, y2: 148, w: 8 },
            { x1: 102, y1: 128, x2: 112, y2: 148, w: 8 },
          ],
          muscles: [
            { cx: 80, cy: 98, rx: 20, ry: 10 },
            { cx: 46, cy: 112, rx: 8, ry: 12, rot: -15 },
            { cx: 114, cy: 112, rx: 8, ry: 12, rot: 15 },
          ],
        }),
      ),
    ),

  plank: () =>
    svgWrap(
      "Plank",
      panel(
        30,
        fig({
          extras: floor(130),
          head: { cx: 28, cy: 108 },
          torso: `<path d="M28 118 L120 118 L120 132 L28 132 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 28, y1: 108, x2: 18, y2: 125, w: 7 },
            { x1: 120, y1: 125, x2: 145, y2: 128, w: 9 },
            { x1: 120, y1: 125, x2: 145, y2: 155, w: 9 },
          ],
          muscles: [{ cx: 75, cy: 125, rx: 38, ry: 12 }],
        }),
      ),
    ),

  "side-plank": () =>
    svgWrap(
      "Side plank",
      panel(
        90,
        fig({
          extras: floor(155),
          head: { cx: 100, cy: 58 },
          torso: `<path d="M96 68 L96 115 L104 115 L104 68 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 96, y1: 75, x2: 70, y2: 95, w: 8 },
            { x1: 100, y1: 115, x2: 130, y2: 140, w: 9 },
            { x1: 100, y1: 115, x2: 95, y2: 155, w: 8 },
          ],
          muscles: [{ cx: 98, cy: 92, rx: 10, ry: 28, rot: 0 }],
        }),
      ),
    ),

  squat: () =>
    svgWrap(
      "Squat",
      dual(
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 32 },
          torso: `<path d="M68 42 L72 72 L88 72 L92 42 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 68, y1: 48, x2: 52, y2: 58, w: 7 },
            { x1: 92, y1: 48, x2: 108, y2: 58, w: 7 },
            { x1: 72, y1: 72, x2: 62, y2: 118, w: 10 },
            { x1: 88, y1: 72, x2: 98, y2: 118, w: 10 },
            { x1: 62, y1: 118, x2: 58, y2: 165, w: 9 },
            { x1: 98, y1: 118, x2: 102, y2: 165, w: 9 },
          ],
          muscles: [
            { cx: 80, cy: 58, rx: 16, ry: 14 },
            { cx: 64, cy: 105, rx: 12, ry: 18, rot: -8 },
            { cx: 96, cy: 105, rx: 12, ry: 18, rot: 8 },
          ],
        }),
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 48 },
          torso: `<path d="M68 58 L70 88 L90 88 L92 58 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 68, y1: 64, x2: 50, y2: 78, w: 7 },
            { x1: 92, y1: 64, x2: 110, y2: 78, w: 7 },
            { x1: 70, y1: 88, x2: 55, y2: 128, w: 10 },
            { x1: 90, y1: 88, x2: 105, y2: 128, w: 10 },
            { x1: 55, y1: 128, x2: 52, y2: 165, w: 9 },
            { x1: 105, y1: 128, x2: 108, y2: 165, w: 9 },
          ],
          muscles: [
            { cx: 80, cy: 78, rx: 20, ry: 16 },
            { cx: 58, cy: 118, rx: 14, ry: 16, rot: -5 },
            { cx: 102, cy: 118, rx: 14, ry: 16, rot: 5 },
          ],
        }),
      ),
    ),

  lunge: () =>
    svgWrap(
      "Lunge",
      dual(
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 28 },
          torso: `<path d="M70 38 L74 72 L86 72 L90 38 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 70, y1: 44, x2: 54, y2: 54, w: 7 },
            { x1: 90, y1: 44, x2: 106, y2: 54, w: 7 },
            { x1: 74, y1: 72, x2: 58, y2: 118, w: 10 },
            { x1: 86, y1: 72, x2: 108, y2: 145, w: 10 },
            { x1: 58, y1: 118, x2: 55, y2: 165, w: 9 },
            { x1: 108, y1: 145, x2: 115, y2: 165, w: 9 },
          ],
          muscles: [
            { cx: 100, cy: 115, rx: 14, ry: 20 },
            { cx: 62, cy: 130, rx: 11, ry: 16 },
          ],
        }),
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 28 },
          torso: `<path d="M70 38 L74 72 L86 72 L90 38 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 70, y1: 44, x2: 54, y2: 54, w: 7 },
            { x1: 90, y1: 44, x2: 106, y2: 54, w: 7 },
            { x1: 74, y1: 72, x2: 52, y2: 145, w: 10 },
            { x1: 86, y1: 72, x2: 102, y2: 118, w: 10 },
            { x1: 52, y1: 145, x2: 48, y2: 165, w: 9 },
            { x1: 102, y1: 118, x2: 98, y2: 165, w: 9 },
          ],
          muscles: [
            { cx: 58, cy: 115, rx: 14, ry: 20 },
            { cx: 100, cy: 130, rx: 11, ry: 16 },
          ],
        }),
      ),
    ),

  burpee: () =>
    svgWrap(
      "Burpee",
      dual(
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 95 },
          torso: `<path d="M70 105 L74 130 L86 130 L90 105 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 70, y1: 100, x2: 80, y2: 55, w: 8 },
            { x1: 90, y1: 100, x2: 80, y2: 55, w: 8 },
            { x1: 74, y1: 130, x2: 62, y2: 165, w: 9 },
            { x1: 86, y1: 130, x2: 98, y2: 165, w: 9 },
          ],
          muscles: [{ cx: 80, cy: 72, rx: 14, ry: 12 }],
        }),
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 38 },
          torso: `<path d="M70 48 L74 78 L86 78 L90 48 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 70, y1: 54, x2: 52, y2: 68, w: 7 },
            { x1: 90, y1: 54, x2: 108, y2: 68, w: 7 },
            { x1: 74, y1: 78, x2: 62, y2: 128, w: 10 },
            { x1: 86, y1: 78, x2: 98, y2: 128, w: 10 },
            { x1: 62, y1: 128, x2: 58, y2: 165, w: 9 },
            { x1: 98, y1: 128, x2: 102, y2: 165, w: 9 },
          ],
          muscles: [
            { cx: 80, cy: 65, rx: 18, ry: 12 },
            { cx: 64, cy: 110, rx: 12, ry: 16 },
            { cx: 96, cy: 110, rx: 12, ry: 16 },
          ],
        }),
        ["присед", "прыжок"],
      ),
    ),

  "jumping-jack": () =>
    svgWrap(
      "Jumping jack",
      dual(
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 38 },
          torso: `<path d="M70 48 L74 78 L86 78 L90 48 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 52, x2: 62, y2: 62, w: 7 },
            { x1: 86, y1: 52, x2: 98, y2: 62, w: 7 },
            { x1: 62, y1: 62, x2: 48, y2: 52, w: 6 },
            { x1: 98, y1: 62, x2: 112, y2: 52, w: 6 },
            { x1: 74, y1: 78, x2: 68, y2: 128, w: 9 },
            { x1: 86, y1: 78, x2: 92, y2: 128, w: 9 },
            { x1: 68, y1: 128, x2: 65, y2: 165, w: 8 },
            { x1: 92, y1: 128, x2: 95, y2: 165, w: 8 },
          ],
          muscles: [
            { cx: 52, cy: 58, rx: 8, ry: 12, rot: -30 },
            { cx: 108, cy: 58, rx: 8, ry: 12, rot: 30 },
          ],
        }),
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 38 },
          torso: `<path d="M70 48 L74 78 L86 78 L90 48 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 52, x2: 48, y2: 42, w: 7 },
            { x1: 86, y1: 52, x2: 112, y2: 42, w: 7 },
            { x1: 74, y1: 78, x2: 62, y2: 128, w: 9 },
            { x1: 86, y1: 78, x2: 98, y2: 128, w: 9 },
            { x1: 62, y1: 128, x2: 55, y2: 165, w: 8 },
            { x1: 98, y1: 128, x2: 105, y2: 165, w: 8 },
          ],
          muscles: [
            { cx: 42, cy: 48, rx: 9, ry: 14, rot: -40 },
            { cx: 118, cy: 48, rx: 9, ry: 14, rot: 40 },
            { cx: 80, cy: 58, rx: 16, ry: 10 },
          ],
        }),
      ),
    ),

  "high-knees": () =>
    svgWrap(
      "High knees",
      dual(
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 42 },
          torso: `<path d="M70 52 L74 88 L86 88 L90 52 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 58, x2: 58, y2: 68, w: 7 },
            { x1: 86, y1: 58, x2: 102, y2: 68, w: 7 },
            { x1: 74, y1: 88, x2: 68, y2: 135, w: 9 },
            { x1: 86, y1: 88, x2: 105, y2: 72, w: 9 },
            { x1: 68, y1: 135, x2: 65, y2: 165, w: 8 },
            { x1: 105, y1: 72, x2: 108, y2: 95, w: 8 },
          ],
          muscles: [{ cx: 108, cy: 78, rx: 10, ry: 16, rot: 15 }],
        }),
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 42 },
          torso: `<path d="M70 52 L74 88 L86 88 L90 52 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 58, x2: 58, y2: 68, w: 7 },
            { x1: 86, y1: 58, x2: 102, y2: 68, w: 7 },
            { x1: 86, y1: 88, x2: 92, y2: 135, w: 9 },
            { x1: 74, y1: 88, x2: 55, y2: 72, w: 9 },
            { x1: 92, y1: 135, x2: 95, y2: 165, w: 8 },
            { x1: 55, y1: 72, x2: 52, y2: 95, w: 8 },
          ],
          muscles: [{ cx: 52, cy: 78, rx: 10, ry: 16, rot: -15 }],
        }),
      ),
    ),

  "shoulder-rotation": () =>
    svgWrap(
      "Shoulder rotation",
      panel(
        100,
        fig({
          extras: `${floor(168)}<path d="M40 75 Q80 45 120 75" fill="none" stroke="#ff7043" stroke-width="2" stroke-dasharray="5 4"/>`,
          head: { cx: 80, cy: 48 },
          torso: `<path d="M70 58 L74 108 L86 108 L90 58 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 64, x2: 48, y2: 78, w: 7 },
            { x1: 86, y1: 64, x2: 112, y2: 78, w: 7 },
            { x1: 74, y1: 108, x2: 68, y2: 155, w: 9 },
            { x1: 86, y1: 108, x2: 92, y2: 155, w: 9 },
            { x1: 68, y1: 155, x2: 65, y2: 165, w: 8 },
            { x1: 92, y1: 155, x2: 95, y2: 165, w: 8 },
          ],
          muscles: [{ cx: 80, cy: 72, rx: 24, ry: 10 }],
        }),
      ),
    ),

  "arm-raise": () =>
    svgWrap(
      "Arm raise",
      dual(
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 42 },
          torso: `<path d="M70 52 L74 95 L86 95 L90 52 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 58, x2: 62, y2: 72, w: 7 },
            { x1: 86, y1: 58, x2: 98, y2: 72, w: 7 },
            { x1: 62, y1: 72, x2: 58, y2: 105, w: 6 },
            { x1: 98, y1: 72, x2: 102, y2: 105, w: 6 },
            { x1: 74, y1: 95, x2: 68, y2: 155, w: 9 },
            { x1: 86, y1: 95, x2: 92, y2: 155, w: 9 },
          ],
          muscles: [
            { cx: 58, cy: 95, rx: 8, ry: 14, rot: -10 },
            { cx: 102, cy: 95, rx: 8, ry: 14, rot: 10 },
          ],
        }),
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 42 },
          torso: `<path d="M70 52 L74 95 L86 95 L90 52 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 58, x2: 48, y2: 38, w: 7 },
            { x1: 86, y1: 58, x2: 112, y2: 38, w: 7 },
            { x1: 74, y1: 95, x2: 68, y2: 155, w: 9 },
            { x1: 86, y1: 95, x2: 92, y2: 155, w: 9 },
          ],
          muscles: [
            { cx: 45, cy: 42, rx: 9, ry: 14, rot: -35 },
            { cx: 115, cy: 42, rx: 9, ry: 14, rot: 35 },
            { cx: 80, cy: 68, rx: 20, ry: 10 },
          ],
        }),
        ["вниз", "вверх"],
      ),
    ),

  stretch: () =>
    svgWrap(
      "Stretch",
      panel(
        100,
        fig({
          extras: floor(168),
          head: { cx: 80, cy: 55 },
          torso: `<path d="M72 65 L74 115 L86 115 L88 65 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 70, x2: 55, y2: 88, w: 7 },
            { x1: 86, y1: 70, x2: 105, y2: 88, w: 7 },
            { x1: 74, y1: 115, x2: 72, y2: 155, w: 9 },
            { x1: 86, y1: 115, x2: 88, y2: 155, w: 9 },
          ],
          muscles: [{ cx: 80, cy: 105, rx: 26, ry: 10 }],
        }),
      ),
    ),

  "cat-cow": () =>
    svgWrap(
      "Cat-cow",
      dual(
        fig({
          extras: floor(130),
          head: { cx: 28, cy: 95 },
          torso: `<path d="M28 105 L115 108 L115 122 L28 118 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 115, y1: 115, x2: 138, y2: 128, w: 8 },
            { x1: 115, y1: 115, x2: 138, y2: 148, w: 8 },
          ],
          muscles: [
            {
              cx: 72,
              cy: 108,
              rx: 35,
              ry: 8,
            },
          ],
        }),
        fig({
          extras: floor(125),
          head: { cx: 28, cy: 88 },
          torso: `<path d="M28 98 L115 112 L115 126 L28 110 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 115, y1: 118, x2: 138, y2: 132, w: 8 },
            { x1: 115, y1: 118, x2: 138, y2: 152, w: 8 },
          ],
          muscles: [{ cx: 72, cy: 118, rx: 35, ry: 8 }],
        }),
        ["корова", "кошка"],
      ),
    ),

  "bird-dog": () =>
    svgWrap(
      "Bird-dog",
      panel(
        90,
        fig({
          extras: floor(130),
          head: { cx: 28, cy: 100 },
          torso: `<path d="M28 110 L115 112 L115 126 L28 122 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 115, y1: 118, x2: 138, y2: 132, w: 8 },
            { x1: 115, y1: 118, x2: 138, y2: 152, w: 8 },
            { x1: 115, y1: 115, x2: 145, y2: 75, w: 7 },
            { x1: 115, y1: 115, x2: 48, y2: 82, w: 7 },
          ],
          muscles: [
            { cx: 148, cy: 78, rx: 10, ry: 14, rot: 25 },
            { cx: 45, cy: 85, rx: 10, ry: 14, rot: -25 },
          ],
        }),
      ),
    ),

  "glute-bridge": () =>
    svgWrap(
      "Glute bridge",
      dual(
        fig({
          extras: floor(145),
          head: { cx: 28, cy: 115 },
          torso: `<path d="M28 125 L100 128 L100 142 L28 138 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 100, y1: 135, x2: 125, y2: 145, w: 9 },
            { x1: 100, y1: 135, x2: 125, y2: 158, w: 9 },
          ],
          muscles: [{ cx: 65, cy: 132, rx: 12, ry: 8 }],
        }),
        fig({
          extras: floor(145),
          head: { cx: 28, cy: 108 },
          torso: `<path d="M28 118 L100 105 L100 119 L28 128 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 100, y1: 112, x2: 125, y2: 138, w: 9 },
            { x1: 100, y1: 112, x2: 125, y2: 155, w: 9 },
          ],
          muscles: [
            { cx: 72, cy: 118, rx: 28, ry: 14 },
            { cx: 118, cy: 142, rx: 10, ry: 10 },
          ],
        }),
        ["лёжа", "мост"],
      ),
    ),

  superman: () =>
    svgWrap(
      "Superman",
      panel(
        90,
        fig({
          extras: floor(155),
          head: { cx: 80, cy: 95 },
          torso: `<path d="M70 105 L74 125 L86 125 L90 105 Z" fill="url(#skin)" stroke="#5d6b7a"/>`,
          limbs: [
            { x1: 74, y1: 100, x2: 74, y2: 55, w: 8 },
            { x1: 74, y1: 108, x2: 48, y2: 125, w: 7 },
            { x1: 86, y1: 108, x2: 112, y2: 125, w: 7 },
            { x1: 48, y1: 125, x2: 38, y2: 148, w: 6 },
            { x1: 112, y1: 125, x2: 122, y2: 148, w: 6 },
            { x1: 74, y1: 125, x2: 68, y2: 158, w: 9 },
            { x1: 86, y1: 125, x2: 92, y2: 158, w: 9 },
          ],
          muscles: [
            { cx: 80, cy: 78, rx: 16, ry: 10 },
            { cx: 42, cy: 55, rx: 8, ry: 12, rot: -25 },
            { cx: 118, cy: 55, rx: 8, ry: 12, rot: 25 },
            { cx: 40, cy: 148, rx: 9, ry: 12 },
            { cx: 120, cy: 148, rx: 9, ry: 12 },
          ],
        }),
      ),
    ),
};

for (const [slug, build] of Object.entries(exercises)) {
  const file = path.join(outDir, `${slug}.svg`);
  fs.writeFileSync(file, build());
  console.log("wrote", file);
}
