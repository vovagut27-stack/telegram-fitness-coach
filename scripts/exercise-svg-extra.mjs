/**
 * Additional exercise SVG builders (home + gym).
 * Merged into generate-exercise-svgs.mjs
 */
export function buildExtraExercises(ctx) {
  const { svgWrap, dual, single, fig, floor } = ctx;
  const p = (slug) => slug.replace(/[^a-z0-9-]/g, "");

  const bench = (y = 138) =>
    `<rect x="14" y="${y}" width="140" height="10" rx="3" fill="#94a3b8"/><rect x="18" y="${y + 10}" width="8" height="28" fill="#64748b"/><rect x="146" y="${y + 10}" width="8" height="28" fill="#64748b"/>`;
  const bar = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#475569" stroke-width="5" stroke-linecap="round"/>`;
  const cable = (x = 140) =>
    `<line x1="${x}" y1="20" x2="${x}" y2="150" stroke="#64748b" stroke-width="3"/><circle cx="${x}" cy="20" r="6" fill="#94a3b8"/>`;

  return {
    "close-grip-push-up": (slug) =>
      svgWrap(
        slug,
        "Close-grip push-up",
        dual(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 52 },
              torso: `<path d="M72 64 L76 92 L92 92 L96 64 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 76, y1: 70, x2: 68, y2: 88, w: 7 },
                { x1: 92, y1: 70, x2: 100, y2: 88, w: 7 },
                { x1: 72, y1: 70, x2: 42, y2: 92, w: 7 },
                { x1: 96, y1: 70, x2: 126, y2: 92, w: 7 },
                { x1: 76, y1: 92, x2: 58, y2: 132, w: 10 },
                { x1: 92, y1: 92, x2: 110, y2: 132, w: 10 },
                { x1: 58, y1: 132, x2: 44, y2: 168, w: 9 },
                { x1: 110, y1: 132, x2: 124, y2: 168, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 78, rx: 20, ry: 10 },
                { cx: 84, cy: 95, rx: 12, ry: 14 },
              ],
            },
            slug,
          ),
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 66 },
              torso: `<path d="M72 78 L76 106 L92 106 L96 78 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 76, y1: 84, x2: 68, y2: 102, w: 7 },
                { x1: 92, y1: 84, x2: 100, y2: 102, w: 7 },
                { x1: 72, y1: 84, x2: 42, y2: 106, w: 7 },
                { x1: 96, y1: 84, x2: 126, y2: 106, w: 7 },
                { x1: 76, y1: 106, x2: 58, y2: 146, w: 10 },
                { x1: 92, y1: 106, x2: 110, y2: 146, w: 10 },
                { x1: 58, y1: 146, x2: 44, y2: 168, w: 9 },
                { x1: 110, y1: 146, x2: 124, y2: 168, w: 9 },
              ],
              muscles: [{ cx: 84, cy: 100, rx: 22, ry: 12 }],
            },
            slug,
          ),
        ),
      ),

    "triceps-dip": (slug) =>
      svgWrap(
        slug,
        "Triceps dip",
        single(
          slug,
          fig(
            {
              extras: `${floor(168)}<rect x="20" y="48" width="128" height="8" rx="4" fill="#64748b"/>`,
              head: { cx: 84, cy: 78 },
              torso: `<path d="M74 88 L78 118 L90 118 L94 88 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 74, y1: 92, x2: 38, y2: 56, w: 8 },
                { x1: 94, y1: 92, x2: 130, y2: 56, w: 8 },
                { x1: 78, y1: 118, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 118, x2: 96, y2: 158, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 102, rx: 18, ry: 10 },
                { cx: 48, cy: 68, rx: 9, ry: 14, rot: -20 },
                { cx: 120, cy: 68, rx: 9, ry: 14, rot: 20 },
              ],
            },
            slug,
          ),
        ),
      ),

    crunch: (slug) =>
      svgWrap(
        slug,
        "Crunch",
        single(
          slug,
          fig(
            {
              extras: `${floor(155)}${bench(148)}`,
              head: { cx: 118, cy: 108 },
              torso: `<path d="M95 118 L118 95 L130 108 L108 128 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 108, y1: 128, x2: 88, y2: 148, w: 9 },
                { x1: 118, y1: 128, x2: 138, y2: 148, w: 9 },
                { x1: 95, y1: 118, x2: 72, y2: 128, w: 8 },
              ],
              muscles: [{ cx: 108, cy: 112, rx: 22, ry: 14 }],
            },
            slug,
          ),
        ),
      ),

    "bicycle-crunch": (slug) =>
      svgWrap(
        slug,
        "Bicycle crunch",
        dual(
          slug,
          fig(
            {
              extras: `${floor(155)}${bench(148)}`,
              head: { cx: 110, cy: 112 },
              torso: `<path d="M88 122 L110 100 L122 112 L100 132 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 100, y1: 132, x2: 118, y2: 95, w: 9 },
                { x1: 88, y1: 122, x2: 62, y2: 135, w: 8 },
              ],
              muscles: [{ cx: 102, cy: 115, rx: 20, ry: 12 }],
            },
            slug,
          ),
          fig(
            {
              extras: `${floor(155)}${bench(148)}`,
              head: { cx: 110, cy: 112 },
              torso: `<path d="M88 122 L110 100 L122 112 L100 132 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 100, y1: 132, x2: 82, y2: 95, w: 9 },
                { x1: 88, y1: 122, x2: 62, y2: 135, w: 8 },
              ],
              muscles: [{ cx: 102, cy: 115, rx: 20, ry: 12 }],
            },
            slug,
          ),
          ["лево", "право"],
        ),
      ),

    "mountain-climber": (slug) =>
      svgWrap(
        slug,
        "Mountain climber",
        dual(
          slug,
          fig(
            {
              extras: floor(138),
              head: { cx: 32, cy: 108 },
              torso: `<path d="M32 118 L120 120 L120 134 L32 130 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 120, y1: 126, x2: 145, y2: 140, w: 8 },
                { x1: 120, y1: 126, x2: 145, y2: 162, w: 8 },
                { x1: 120, y1: 124, x2: 100, y2: 88, w: 9 },
              ],
              muscles: [{ cx: 78, cy: 124, rx: 36, ry: 10 }],
            },
            slug,
          ),
          fig(
            {
              extras: floor(138),
              head: { cx: 32, cy: 108 },
              torso: `<path d="M32 118 L120 120 L120 134 L32 130 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 120, y1: 126, x2: 145, y2: 140, w: 8 },
                { x1: 120, y1: 126, x2: 145, y2: 162, w: 8 },
                { x1: 120, y1: 124, x2: 138, y2: 88, w: 9 },
              ],
              muscles: [{ cx: 78, cy: 124, rx: 36, ry: 10 }],
            },
            slug,
          ),
        ),
      ),

    "wall-sit": (slug) =>
      svgWrap(
        slug,
        "Wall sit",
        single(
          slug,
          fig(
            {
              extras: `<rect x="8" y="40" width="10" height="128" fill="#cbd5e1" rx="2"/>${floor(168)}`,
              head: { cx: 84, cy: 58 },
              torso: `<path d="M72 68 L76 108 L92 108 L96 68 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 76, y1: 74, x2: 58, y2: 88, w: 7 },
                { x1: 92, y1: 74, x2: 110, y2: 88, w: 7 },
                { x1: 76, y1: 108, x2: 68, y2: 148, w: 10 },
                { x1: 92, y1: 108, x2: 100, y2: 148, w: 10 },
                { x1: 68, y1: 148, x2: 66, y2: 168, w: 9 },
                { x1: 100, y1: 148, x2: 102, y2: 168, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 88, rx: 18, ry: 14 },
                { cx: 70, cy: 132, rx: 14, ry: 18 },
                { cx: 98, cy: 132, rx: 14, ry: 18 },
              ],
            },
            slug,
          ),
        ),
      ),

    "calf-raise": (slug) =>
      svgWrap(
        slug,
        "Calf raise",
        dual(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 38 },
              torso: `<path d="M74 48 L78 100 L90 100 L94 48 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 54, x2: 62, y2: 68, w: 7 },
                { x1: 90, y1: 54, x2: 106, y2: 68, w: 7 },
                { x1: 78, y1: 100, x2: 72, y2: 148, w: 9 },
                { x1: 90, y1: 100, x2: 96, y2: 148, w: 9 },
                { x1: 72, y1: 148, x2: 70, y2: 168, w: 8 },
                { x1: 96, y1: 148, x2: 98, y2: 168, w: 8 },
              ],
              muscles: [{ cx: 84, cy: 142, rx: 20, ry: 10 }],
            },
            slug,
          ),
          fig(
            {
              extras: `${floor(168)}<ellipse cx="84" cy="162" rx="28" ry="6" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 3"/>`,
              head: { cx: 84, cy: 32 },
              torso: `<path d="M74 42 L78 94 L90 94 L94 42 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 48, x2: 62, y2: 62, w: 7 },
                { x1: 90, y1: 48, x2: 106, y2: 62, w: 7 },
                { x1: 78, y1: 94, x2: 74, y2: 152, w: 9 },
                { x1: 90, y1: 94, x2: 94, y2: 152, w: 9 },
                { x1: 74, y1: 152, x2: 72, y2: 162, w: 8 },
                { x1: 94, y1: 152, x2: 96, y2: 162, w: 8 },
              ],
              muscles: [{ cx: 84, cy: 128, rx: 16, ry: 12 }],
            },
            slug,
          ),
          ["пятки", "носки"],
        ),
      ),

    "pull-up": (slug) =>
      svgWrap(
        slug,
        "Pull-up",
        single(
          slug,
          fig(
            {
              extras: `${bar(28, 42, 140, 42)}`,
              head: { cx: 84, cy: 72 },
              torso: `<path d="M74 82 L78 118 L90 118 L94 82 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 74, y1: 88, x2: 58, y2: 48, w: 8 },
                { x1: 94, y1: 88, x2: 110, y2: 48, w: 8 },
                { x1: 78, y1: 118, x2: 76, y2: 158, w: 9 },
                { x1: 90, y1: 118, x2: 92, y2: 158, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 98, rx: 22, ry: 12 },
                { cx: 56, cy: 62, rx: 10, ry: 14, rot: -25 },
                { cx: 112, cy: 62, rx: 10, ry: 14, rot: 25 },
              ],
            },
            slug,
          ),
        ),
      ),

    "inverted-row": (slug) =>
      svgWrap(
        slug,
        "Inverted row",
        single(
          slug,
          fig(
            {
              extras: `${bar(20, 52, 148, 52)}`,
              head: { cx: 84, cy: 95 },
              torso: `<path d="M74 102 L78 128 L90 128 L94 102 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 74, y1: 98, x2: 74, y2: 58, w: 8 },
                { x1: 94, y1: 98, x2: 94, y2: 58, w: 8 },
                { x1: 78, y1: 128, x2: 64, y2: 158, w: 9 },
                { x1: 90, y1: 128, x2: 104, y2: 158, w: 9 },
              ],
              muscles: [{ cx: 84, cy: 115, rx: 24, ry: 11 }],
            },
            slug,
          ),
        ),
      ),

    "hip-hinge": (slug) =>
      svgWrap(
        slug,
        "Hip hinge / Row",
        single(
          slug,
          fig(
            {
              extras: `${floor(168)}${bar(40, 118, 128, 118)}`,
              head: { cx: 84, cy: 72 },
              torso: `<path d="M74 82 L78 118 L90 118 L94 82 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 88, x2: 58, y2: 118, w: 8 },
                { x1: 90, y1: 88, x2: 110, y2: 118, w: 8 },
                { x1: 78, y1: 118, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 118, x2: 96, y2: 158, w: 9 },
                { x1: 72, y1: 158, x2: 68, y2: 168, w: 8 },
                { x1: 96, y1: 158, x2: 100, y2: 168, w: 8 },
              ],
              muscles: [
                { cx: 84, cy: 128, rx: 26, ry: 12 },
                { cx: 84, cy: 98, rx: 18, ry: 10 },
              ],
            },
            slug,
          ),
        ),
      ),

    "pike-push-up": (slug) =>
      svgWrap(
        slug,
        "Pike push-up",
        single(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 118 },
              torso: `<path d="M74 108 L78 88 L90 88 L94 108 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 92, x2: 62, y2: 68, w: 8 },
                { x1: 90, y1: 92, x2: 106, y2: 68, w: 8 },
                { x1: 78, y1: 108, x2: 68, y2: 148, w: 9 },
                { x1: 90, y1: 108, x2: 100, y2: 148, w: 9 },
                { x1: 68, y1: 148, x2: 64, y2: 168, w: 8 },
                { x1: 100, y1: 148, x2: 104, y2: 168, w: 8 },
              ],
              muscles: [
                { cx: 84, cy: 78, rx: 16, ry: 12 },
                { cx: 84, cy: 98, rx: 20, ry: 10 },
              ],
            },
            slug,
          ),
        ),
      ),

    "reverse-plank": (slug) =>
      svgWrap(
        slug,
        "Reverse plank",
        single(
          slug,
          fig(
            {
              extras: floor(155),
              head: { cx: 28, cy: 108 },
              torso: `<path d="M28 118 L120 115 L120 131 L28 128 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 28, y1: 108, x2: 18, y2: 128, w: 7 },
                { x1: 120, y1: 123, x2: 145, y2: 128, w: 9 },
                { x1: 120, y1: 123, x2: 145, y2: 155, w: 9 },
              ],
              muscles: [{ cx: 75, cy: 122, rx: 40, ry: 12 }],
            },
            slug,
          ),
        ),
      ),

    "hollow-body": (slug) =>
      svgWrap(
        slug,
        "Hollow / V-up",
        single(
          slug,
          fig(
            {
              extras: floor(155),
              head: { cx: 28, cy: 118 },
              torso: `<path d="M28 128 L95 108 L108 118 L40 138 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 95, y1: 108, x2: 130, y2: 95, w: 8 },
                { x1: 40, y1: 138, x2: 55, y2: 158, w: 8 },
              ],
              muscles: [{ cx: 68, cy: 122, rx: 32, ry: 10 }],
            },
            slug,
          ),
        ),
      ),

    "sumo-squat": (slug) =>
      svgWrap(
        slug,
        "Sumo squat",
        single(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 48 },
              torso: `<path d="M70 58 L74 98 L94 98 L98 58 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 74, y1: 64, x2: 54, y2: 78, w: 7 },
                { x1: 94, y1: 64, x2: 114, y2: 78, w: 7 },
                { x1: 72, y1: 98, x2: 52, y2: 138, w: 11 },
                { x1: 92, y1: 98, x2: 116, y2: 138, w: 11 },
                { x1: 52, y1: 138, x2: 48, y2: 168, w: 10 },
                { x1: 116, y1: 138, x2: 120, y2: 168, w: 10 },
              ],
              muscles: [
                { cx: 84, cy: 78, rx: 22, ry: 14 },
                { cx: 58, cy: 125, rx: 14, ry: 18 },
                { cx: 110, cy: 125, rx: 14, ry: 18 },
              ],
            },
            slug,
          ),
        ),
      ),

    "lateral-lunge": (slug) =>
      svgWrap(
        slug,
        "Lateral lunge",
        single(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 32 },
              torso: `<path d="M74 42 L78 78 L90 78 L94 42 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 48, x2: 62, y2: 58, w: 7 },
                { x1: 90, y1: 48, x2: 106, y2: 58, w: 7 },
                { x1: 78, y1: 78, x2: 72, y2: 128, w: 10 },
                { x1: 90, y1: 78, x2: 118, y2: 128, w: 10 },
                { x1: 72, y1: 128, x2: 70, y2: 168, w: 9 },
                { x1: 118, y1: 128, x2: 122, y2: 168, w: 9 },
              ],
              muscles: [{ cx: 112, cy: 115, rx: 16, ry: 20 }],
            },
            slug,
          ),
        ),
      ),

    "squat-jump": (slug) =>
      svgWrap(
        slug,
        "Squat jump",
        dual(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 52 },
              torso: `<path d="M70 62 L74 102 L94 102 L98 62 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 72, y1: 102, x2: 58, y2: 142, w: 10 },
                { x1: 92, y1: 102, x2: 110, y2: 142, w: 10 },
                { x1: 58, y1: 142, x2: 54, y2: 168, w: 9 },
                { x1: 110, y1: 142, x2: 114, y2: 168, w: 9 },
              ],
              muscles: [
                { cx: 66, cy: 128, rx: 14, ry: 18 },
                { cx: 102, cy: 128, rx: 14, ry: 18 },
              ],
            },
            slug,
          ),
          fig(
            {
              extras: `${floor(168)}<path d="M70 158 Q84 140 98 158" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 3"/>`,
              head: { cx: 84, cy: 28 },
              torso: `<path d="M74 38 L78 72 L90 72 L94 38 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 72, x2: 72, y2: 118, w: 9 },
                { x1: 90, y1: 72, x2: 96, y2: 118, w: 9 },
                { x1: 72, y1: 118, x2: 68, y2: 148, w: 8 },
                { x1: 96, y1: 118, x2: 100, y2: 148, w: 8 },
              ],
              muscles: [{ cx: 84, cy: 55, rx: 18, ry: 12 }],
            },
            slug,
          ),
        ),
      ),

    "generic-workout": (slug) =>
      svgWrap(
        slug,
        "Exercise",
        single(
          slug,
          fig(
            {
              extras: `${floor(168)}<circle cx="84" cy="88" r="36" fill="none" stroke="#10b981" stroke-width="2" opacity="0.5"/>`,
              head: { cx: 84, cy: 48 },
              torso: `<path d="M74 58 L78 108 L90 108 L94 58 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 64, x2: 58, y2: 88, w: 8 },
                { x1: 90, y1: 64, x2: 110, y2: 88, w: 8 },
                { x1: 78, y1: 108, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 108, x2: 96, y2: 158, w: 9 },
              ],
              muscles: [{ cx: 84, cy: 82, rx: 20, ry: 14 }],
            },
            slug,
          ),
        ),
      ),

    "bench-press": (slug) =>
      svgWrap(
        slug,
        "Bench press",
        single(
          slug,
          fig(
            {
              extras: `${bench(132)}${bar(24, 108, 144, 108)}`,
              head: { cx: 28, cy: 108 },
              torso: `<path d="M28 118 L115 118 L115 134 L28 130 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 28, y1: 108, x2: 18, y2: 125, w: 7 },
                { x1: 115, y1: 118, x2: 138, y2: 108, w: 8 },
                { x1: 115, y1: 118, x2: 138, y2: 128, w: 8 },
              ],
              muscles: [
                { cx: 72, cy: 122, rx: 38, ry: 12 },
                { cx: 130, cy: 112, rx: 10, ry: 14, rot: 15 },
              ],
            },
            slug,
          ),
        ),
      ),

    "incline-press": (slug) =>
      svgWrap(
        slug,
        "Incline press",
        single(
          slug,
          fig(
            {
              extras: `<path d="M14 148 L154 118" stroke="#94a3b8" stroke-width="10" stroke-linecap="round"/>${bar(30, 95, 140, 88)}`,
              head: { cx: 32, cy: 102 },
              torso: `<path d="M32 112 L118 108 L118 124 L32 120 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 118, y1: 114, x2: 142, y2: 98, w: 8 },
                { x1: 118, y1: 114, x2: 142, y2: 118, w: 8 },
              ],
              muscles: [{ cx: 78, cy: 112, rx: 36, ry: 12 }],
            },
            slug,
          ),
        ),
      ),

    "chest-fly": (slug) =>
      svgWrap(
        slug,
        "Chest fly",
        single(
          slug,
          fig(
            {
              extras: bench(132),
              head: { cx: 84, cy: 108 },
              torso: `<path d="M74 118 L78 132 L90 132 L94 118 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 122, x2: 42, y2: 108, w: 7 },
                { x1: 90, y1: 122, x2: 126, y2: 108, w: 7 },
                { x1: 78, y1: 132, x2: 72, y2: 158, w: 8 },
                { x1: 90, y1: 132, x2: 96, y2: 158, w: 8 },
              ],
              muscles: [
                { cx: 84, cy: 125, rx: 22, ry: 10 },
                { cx: 48, cy: 112, rx: 10, ry: 14, rot: -20 },
                { cx: 120, cy: 112, rx: 10, ry: 14, rot: 20 },
              ],
            },
            slug,
          ),
        ),
      ),

    "cable-crossover": (slug) =>
      svgWrap(
        slug,
        "Cable crossover",
        single(
          slug,
          fig(
            {
              extras: `${cable(28)}${cable(152)}`,
              head: { cx: 84, cy: 48 },
              torso: `<path d="M74 58 L78 108 L90 108 L94 58 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 64, x2: 32, y2: 72, w: 7 },
                { x1: 90, y1: 64, x2: 136, y2: 72, w: 7 },
                { x1: 78, y1: 108, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 108, x2: 96, y2: 158, w: 9 },
              ],
              muscles: [{ cx: 84, cy: 78, rx: 24, ry: 12 }],
            },
            slug,
          ),
        ),
      ),

    "cable-triceps": (slug) =>
      svgWrap(
        slug,
        "Triceps pushdown",
        single(
          slug,
          fig(
            {
              extras: cable(84),
              head: { cx: 84, cy: 42 },
              torso: `<path d="M74 52 L78 98 L90 98 L94 52 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 58, x2: 78, y2: 78, w: 7 },
                { x1: 90, y1: 58, x2: 90, y2: 78, w: 7 },
                { x1: 78, y1: 98, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 98, x2: 96, y2: 158, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 88, rx: 14, ry: 18 },
                { cx: 84, cy: 68, rx: 12, ry: 10 },
              ],
            },
            slug,
          ),
        ),
      ),

    "lat-pulldown": (slug) =>
      svgWrap(
        slug,
        "Lat pulldown",
        single(
          slug,
          fig(
            {
              extras: `${bar(40, 38, 128, 38)}<rect x="50" y="148" width="68" height="8" rx="3" fill="#94a3b8"/>`,
              head: { cx: 84, cy: 58 },
              torso: `<path d="M74 68 L78 118 L90 118 L94 68 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 74, x2: 58, y2: 48, w: 8 },
                { x1: 90, y1: 74, x2: 110, y2: 48, w: 8 },
                { x1: 78, y1: 118, x2: 72, y2: 148, w: 9 },
                { x1: 90, y1: 118, x2: 96, y2: 148, w: 9 },
              ],
              muscles: [{ cx: 84, cy: 92, rx: 24, ry: 14 }],
            },
            slug,
          ),
        ),
      ),

    "cable-row": (slug) =>
      svgWrap(
        slug,
        "Seated row",
        single(
          slug,
          fig(
            {
              extras: `<rect x="50" y="148" width="68" height="8" rx="3" fill="#94a3b8"/>${cable(148)}`,
              head: { cx: 84, cy: 62 },
              torso: `<path d="M74 72 L78 112 L90 112 L94 72 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 78, x2: 118, y2: 95, w: 8 },
                { x1: 90, y1: 78, x2: 130, y2: 95, w: 8 },
                { x1: 78, y1: 112, x2: 72, y2: 148, w: 9 },
                { x1: 90, y1: 112, x2: 96, y2: 148, w: 9 },
              ],
              muscles: [{ cx: 84, cy: 95, rx: 26, ry: 12 }],
            },
            slug,
          ),
        ),
      ),

    "dumbbell-row": (slug) =>
      svgWrap(
        slug,
        "Dumbbell row",
        single(
          slug,
          fig(
            {
              extras: `${bench(132)}<ellipse cx="128" cy="108" rx="10" ry="6" fill="#64748b"/>`,
              head: { cx: 32, cy: 108 },
              torso: `<path d="M32 118 L100 115 L100 131 L32 128 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 100, y1: 122, x2: 128, y2: 108, w: 8 },
                { x1: 100, y1: 122, x2: 128, y2: 138, w: 8 },
              ],
              muscles: [{ cx: 72, cy: 120, rx: 32, ry: 11 }],
            },
            slug,
          ),
        ),
      ),

    "barbell-curl": (slug) =>
      svgWrap(
        slug,
        "Barbell curl",
        single(
          slug,
          fig(
            {
              extras: `${floor(168)}${bar(48, 72, 120, 72)}`,
              head: { cx: 84, cy: 42 },
              torso: `<path d="M74 52 L78 108 L90 108 L94 52 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 58, x2: 52, y2: 72, w: 8 },
                { x1: 90, y1: 58, x2: 116, y2: 72, w: 8 },
                { x1: 78, y1: 108, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 108, x2: 96, y2: 158, w: 9 },
              ],
              muscles: [
                { cx: 52, cy: 78, rx: 10, ry: 14, rot: -15 },
                { cx: 116, cy: 78, rx: 10, ry: 14, rot: 15 },
              ],
            },
            slug,
          ),
        ),
      ),

    "barbell-squat": (slug) =>
      svgWrap(
        slug,
        "Barbell squat",
        single(
          slug,
          fig(
            {
              extras: `${floor(168)}${bar(40, 58, 128, 58)}`,
              head: { cx: 84, cy: 48 },
              torso: `<path d="M70 62 L74 102 L94 102 L98 62 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 72, y1: 102, x2: 58, y2: 142, w: 10 },
                { x1: 92, y1: 102, x2: 110, y2: 142, w: 10 },
                { x1: 58, y1: 142, x2: 54, y2: 168, w: 9 },
                { x1: 110, y1: 142, x2: 114, y2: 168, w: 9 },
              ],
              muscles: [
                { cx: 66, cy: 128, rx: 14, ry: 18 },
                { cx: 102, cy: 128, rx: 14, ry: 18 },
                { cx: 84, cy: 78, rx: 20, ry: 12 },
              ],
            },
            slug,
          ),
        ),
      ),

    "leg-press": (slug) =>
      svgWrap(
        slug,
        "Leg press",
        single(
          slug,
          fig(
            {
              extras: `<path d="M20 100 L148 70 L148 150 L20 150 Z" fill="#cbd5e1" opacity="0.5" stroke="#94a3b8"/><rect x="50" y="148" width="68" height="8" rx="3" fill="#94a3b8"/>`,
              head: { cx: 84, cy: 72 },
              torso: `<path d="M74 82 L78 118 L90 118 L94 82 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 118, x2: 68, y2: 95, w: 10 },
                { x1: 90, y1: 118, x2: 100, y2: 95, w: 10 },
              ],
              muscles: [
                { cx: 70, cy: 102, rx: 12, ry: 16 },
                { cx: 98, cy: 102, rx: 12, ry: 16 },
              ],
            },
            slug,
          ),
        ),
      ),

    "romanian-deadlift": (slug) =>
      svgWrap(
        slug,
        "Romanian deadlift",
        single(
          slug,
          fig(
            {
              extras: `${floor(168)}${bar(50, 108, 118, 108)}`,
              head: { cx: 84, cy: 78 },
              torso: `<path d="M74 88 L78 128 L90 128 L94 88 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 94, x2: 62, y2: 118, w: 8 },
                { x1: 90, y1: 94, x2: 106, y2: 118, w: 8 },
                { x1: 78, y1: 128, x2: 72, y2: 162, w: 9 },
                { x1: 90, y1: 128, x2: 96, y2: 162, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 138, rx: 28, ry: 12 },
                { cx: 84, cy: 105, rx: 20, ry: 10 },
              ],
            },
            slug,
          ),
        ),
      ),

    "leg-extension": (slug) =>
      svgWrap(
        slug,
        "Leg extension",
        single(
          slug,
          fig(
            {
              extras: `<rect x="50" y="148" width="68" height="8" rx="3" fill="#94a3b8"/><rect x="100" y="110" width="40" height="6" rx="2" fill="#64748b"/>`,
              head: { cx: 84, cy: 58 },
              torso: `<path d="M74 68 L78 118 L90 118 L94 68 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 118, x2: 72, y2: 148, w: 9 },
                { x1: 90, y1: 118, x2: 128, y2: 108, w: 9 },
              ],
              muscles: [{ cx: 108, cy: 108, rx: 14, ry: 18 }],
            },
            slug,
          ),
        ),
      ),

    "leg-curl": (slug) =>
      svgWrap(
        slug,
        "Leg curl",
        single(
          slug,
          fig(
            {
              extras: `${bench(132)}`,
              head: { cx: 28, cy: 108 },
              torso: `<path d="M28 118 L100 118 L100 132 L28 128 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 100, y1: 125, x2: 128, y2: 108, w: 9 },
                { x1: 100, y1: 125, x2: 128, y2: 138, w: 9 },
              ],
              muscles: [{ cx: 118, cy: 118, rx: 14, ry: 16 }],
            },
            slug,
          ),
        ),
      ),

    "overhead-press": (slug) =>
      svgWrap(
        slug,
        "Overhead press",
        single(
          slug,
          fig(
            {
              extras: `${floor(168)}<ellipse cx="84" cy="42" rx="14" ry="8" fill="#64748b"/>`,
              head: { cx: 84, cy: 58 },
              torso: `<path d="M74 68 L78 118 L90 118 L94 68 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 74, x2: 62, y2: 48, w: 8 },
                { x1: 90, y1: 74, x2: 106, y2: 48, w: 8 },
                { x1: 78, y1: 118, x2: 72, y2: 162, w: 9 },
                { x1: 90, y1: 118, x2: 96, y2: 162, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 82, rx: 22, ry: 12 },
                { cx: 58, cy: 52, rx: 10, ry: 14, rot: -25 },
                { cx: 110, cy: 52, rx: 10, ry: 14, rot: 25 },
              ],
            },
            slug,
          ),
        ),
      ),

    "rear-delt-fly": (slug) =>
      svgWrap(
        slug,
        "Rear delt fly",
        single(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 72 },
              torso: `<path d="M74 82 L78 118 L90 118 L94 82 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 88, x2: 48, y2: 102, w: 7 },
                { x1: 90, y1: 88, x2: 120, y2: 102, w: 7 },
                { x1: 78, y1: 118, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 118, x2: 96, y2: 158, w: 9 },
              ],
              muscles: [
                { cx: 84, cy: 98, rx: 20, ry: 10 },
                { cx: 44, cy: 108, rx: 10, ry: 14, rot: -15 },
                { cx: 124, cy: 108, rx: 10, ry: 14, rot: 15 },
              ],
            },
            slug,
          ),
        ),
      ),

    "skull-crusher": (slug) =>
      svgWrap(
        slug,
        "Skull crusher",
        single(
          slug,
          fig(
            {
              extras: `${bench(132)}${bar(50, 95, 118, 95)}`,
              head: { cx: 84, cy: 108 },
              torso: `<path d="M74 118 L78 138 L90 138 L94 118 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 112, x2: 58, y2: 98, w: 7 },
                { x1: 90, y1: 112, x2: 110, y2: 98, w: 7 },
              ],
              muscles: [{ cx: 84, cy: 102, rx: 16, ry: 14 }],
            },
            slug,
          ),
        ),
      ),

    "hammer-curl": (slug) =>
      svgWrap(
        slug,
        "Hammer curl",
        single(
          slug,
          fig(
            {
              extras: floor(168),
              head: { cx: 84, cy: 42 },
              torso: `<path d="M74 52 L78 108 L90 108 L94 52 Z" fill="url(#${p(slug)}-body)"/>`,
              limbs: [
                { x1: 78, y1: 58, x2: 72, y2: 88, w: 8 },
                { x1: 90, y1: 58, x2: 96, y2: 88, w: 8 },
                { x1: 78, y1: 108, x2: 72, y2: 158, w: 9 },
                { x1: 90, y1: 108, x2: 96, y2: 158, w: 9 },
              ],
              muscles: [
                { cx: 72, cy: 78, rx: 10, ry: 16 },
                { cx: 96, cy: 78, rx: 10, ry: 16 },
              ],
            },
            slug,
          ),
        ),
      ),
  };
}
