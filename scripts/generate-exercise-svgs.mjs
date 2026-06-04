import fs from "node:fs";
import path from "node:path";

const outDir = path.join("webapp", "public", "exercises");
fs.mkdirSync(outDir, { recursive: true });

const gray = "#bdbdbd";
const grayDark = "#757575";
const muscle = "#e53935";
const muscleSoft = "rgba(229,57,53,0.35)";

function svgWrap(title, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" role="img" aria-label="${title}">
  <rect width="320" height="200" fill="#ffffff"/>
  ${body}
</svg>`;
}

function figure(g, musclePaths) {
  return `
  <g fill="${gray}" stroke="${grayDark}" stroke-width="1.2" stroke-linejoin="round">
    ${g}
  </g>
  <g fill="${muscle}" opacity="0.9">${musclePaths}</g>
  <g fill="${muscleSoft}">${musclePaths}</g>`;
}

function panel(x, content) {
  return `<g transform="translate(${x},0)">${content}</g>`;
}

const defs = {
  "push-up": () =>
    svgWrap(
      "Push-up",
      panel(
        8,
        figure(
          `<ellipse cx="72" cy="38" rx="11" ry="13"/>
      <path d="M55 48 L28 72 L18 88 M89 48 L116 72 L126 88"/>
      <path d="M64 50 L68 78 L76 78 L80 50"/>
      <path d="M68 78 L52 98 L92 98 L76 78"/>`,
          `<ellipse cx="72" cy="58" rx="18" ry="8"/>
      <path d="M42 66 L18 74" stroke="${muscle}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M102 66 L126 74" stroke="${muscle}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="72" cy="52" rx="11" ry="13"/>
      <path d="M55 62 L28 86 L18 102 M89 62 L116 86 L126 102"/>
      <path d="M64 64 L68 92 L76 92 L80 64"/>
      <path d="M68 92 L52 112 L92 112 L76 92"/>`,
            `<ellipse cx="72" cy="72" rx="18" ry="8"/>
      <path d="M42 80 L18 88" stroke="${muscle}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M102 80 L126 88" stroke="${muscle}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
          ),
        ),
    ),
  "knee-push-up": () =>
    svgWrap(
      "Knee push-up",
      panel(
        40,
        figure(
          `<ellipse cx="120" cy="70" rx="12" ry="14"/>
      <path d="M100 82 L70 95 L55 108 M140 82 L170 95 L185 108"/>
      <path d="M108 84 L112 108 L128 108 L132 84"/>
      <path d="M112 108 L95 125 L145 125 L128 108"/>
      <path d="M95 125 L75 135 L145 135 L125 125"/>`,
          `<ellipse cx="120" cy="95" rx="20" ry="9"/>
      <path d="M88 102 L62 108" stroke="${muscle}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M152 102 L178 108" stroke="${muscle}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
        ),
      ),
    ),
  plank: () =>
    svgWrap(
      "Plank",
      panel(
        20,
        figure(
          `<ellipse cx="200" cy="95" rx="12" ry="14"/>
      <path d="M180 100 L140 108 L95 112"/>
      <path d="M188 102 L188 118 L204 118 L204 102"/>
      <path d="M188 118 L175 128 L215 128 L202 118"/>
      <path d="M95 112 L55 118 L25 120"/>`,
          `<ellipse cx="155" cy="108" rx="28" ry="10"/>
      <rect x="130" y="100" width="50" height="14" rx="6"/>`,
        ),
      ),
    ),
  "side-plank": () =>
    svgWrap(
      "Side plank",
      panel(
        30,
        figure(
          `<ellipse cx="120" cy="55" rx="11" ry="13"/>
      <path d="M120 68 L120 110"/>
      <path d="M120 75 L85 95 L55 108"/>
      <path d="M120 110 L155 125 L175 132"/>
      <path d="M120 68 L155 78"/>`,
          `<ellipse cx="118" cy="88" rx="8" ry="22"/>
      <path d="M95 95 L70 108" stroke="${muscle}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
        ),
      ),
    ),
  lunge: () =>
    svgWrap(
      "Lunge",
      panel(
        8,
        figure(
          `<ellipse cx="72" cy="32" rx="11" ry="13"/>
      <path d="M72 45 L72 75"/>
      <path d="M72 50 L55 58 M72 50 L89 58"/>
      <path d="M72 75 L55 118 L48 145"/>
      <path d="M72 75 L105 105 L118 135"/>`,
          `<ellipse cx="88" cy="108" rx="14" ry="18"/>
      <ellipse cx="58" cy="125" rx="10" ry="14"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="72" cy="32" rx="11" ry="13"/>
      <path d="M72 45 L72 75"/>
      <path d="M72 50 L55 58 M72 50 L89 58"/>
      <path d="M72 75 L48 118 L42 145"/>
      <path d="M72 75 L108 108 L120 138"/>`,
            `<ellipse cx="52" cy="115" rx="14" ry="18"/>
      <ellipse cx="105" cy="118" rx="10" ry="14"/>`,
          ),
        ),
    ),
  squat: () =>
    svgWrap(
      "Squat",
      panel(
        8,
        figure(
          `<ellipse cx="72" cy="28" rx="11" ry="13"/>
      <path d="M72 41 L72 70"/>
      <path d="M72 48 L52 55 M72 48 L92 55"/>
      <path d="M72 70 L58 105 L52 135"/>
      <path d="M72 70 L86 105 L92 135"/>`,
          `<ellipse cx="72" cy="88" rx="16" ry="14"/>
      <ellipse cx="58" cy="118" rx="10" ry="16"/>
      <ellipse cx="86" cy="118" rx="10" ry="16"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="72" cy="38" rx="11" ry="13"/>
      <path d="M72 51 L72 78"/>
      <path d="M72 58 L50 68 M72 58 L94 68"/>
      <path d="M72 78 L52 108 L45 128"/>
      <path d="M72 78 L92 108 L99 128"/>`,
            `<ellipse cx="72" cy="95" rx="18" ry="16"/>
      <ellipse cx="54" cy="115" rx="12" ry="14"/>
      <ellipse cx="90" cy="115" rx="12" ry="14"/>`,
          ),
        ),
    ),
  burpee: () =>
    svgWrap(
      "Burpee",
      panel(
        8,
        figure(
          `<ellipse cx="72" cy="100" rx="11" ry="13"/>
      <path d="M72 85 L72 55"/>
      <path d="M72 55 L55 45 M72 55 L89 45"/>
      <path d="M72 113 L55 135 L48 155"/>
      <path d="M72 113 L89 135 L96 155"/>`,
          `<ellipse cx="72" cy="68" rx="14" ry="10"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="72" cy="35" rx="11" ry="13"/>
      <path d="M72 48 L72 75"/>
      <path d="M72 55 L52 70 M72 55 L92 70"/>
      <path d="M72 75 L58 118 L52 145"/>
      <path d="M72 75 L86 118 L92 145"/>`,
            `<ellipse cx="72" cy="95" rx="20" ry="10"/>
      <ellipse cx="58" cy="118" rx="10" ry="14"/>
      <ellipse cx="86" cy="118" rx="10" ry="14"/>`,
          ),
        ),
    ),
  "jumping-jack": () =>
    svgWrap(
      "Jumping jack",
      panel(
        8,
        figure(
          `<ellipse cx="72" cy="35" rx="11" ry="13"/>
      <path d="M72 48 L72 85"/>
      <path d="M72 55 L55 62 M72 55 L89 62"/>
      <path d="M55 62 L38 48 M89 62 L106 48"/>
      <path d="M72 85 L62 125 L58 148"/>
      <path d="M72 85 L82 125 L86 148"/>`,
          `<path d="M38 48 L28 38" stroke="${muscle}" stroke-width="5" fill="none"/>
      <path d="M106 48 L116 38" stroke="${muscle}" stroke-width="5" fill="none"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="72" cy="35" rx="11" ry="13"/>
      <path d="M72 48 L72 85"/>
      <path d="M72 55 L48 42 M72 55 L96 42"/>
      <path d="M48 42 L22 35 M96 42 L122 35"/>
      <path d="M72 85 L58 125 L52 148"/>
      <path d="M72 85 L86 125 L92 148"/>`,
            `<path d="M22 35 L12 28" stroke="${muscle}" stroke-width="5" fill="none"/>
      <path d="M122 35 L132 28" stroke="${muscle}" stroke-width="5" fill="none"/>`,
          ),
        ),
    ),
  "high-knees": () =>
    svgWrap(
      "High knees",
      panel(
        8,
        figure(
          `<ellipse cx="72" cy="40" rx="11" ry="13"/>
      <path d="M72 53 L72 90"/>
      <path d="M72 60 L55 68 M72 60 L89 68"/>
      <path d="M72 90 L65 125 L62 148"/>
      <path d="M72 90 L95 72 L102 58"/>`,
          `<ellipse cx="98" cy="62" rx="10" ry="14"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="72" cy="40" rx="11" ry="13"/>
      <path d="M72 53 L72 90"/>
      <path d="M72 60 L55 68 M72 60 L89 68"/>
      <path d="M72 90 L95 125 L102 148"/>
      <path d="M72 90 L58 72 L52 58"/>`,
            `<ellipse cx="55" cy="62" rx="10" ry="14"/>`,
          ),
        ),
    ),
  "shoulder-rotation": () =>
    svgWrap(
      "Shoulder rotation",
      panel(
        40,
        figure(
          `<ellipse cx="120" cy="45" rx="12" ry="14"/>
      <path d="M120 59 L120 110"/>
      <path d="M120 68 L75 75 M120 68 L165 75"/>
      <path d="M75 75 L55 55" stroke="${gray}" fill="none"/>
      <path d="M165 75 L185 95" stroke="${gray}" fill="none"/>
      <path d="M120 110 L100 145 L140 145 L120 110"/>`,
          `<ellipse cx="120" cy="72" rx="22" ry="10"/>
      <path d="M55 55 Q95 25 185 95" stroke="${muscle}" stroke-width="3" fill="none" stroke-dasharray="6 4"/>`,
        ),
      ),
    ),
  "arm-raise": () =>
    svgWrap(
      "Arm raise",
      panel(
        8,
        figure(
          `<ellipse cx="72" cy="38" rx="11" ry="13"/>
      <path d="M72 51 L72 95"/>
      <path d="M72 58 L58 65 M72 58 L86 65"/>
      <path d="M58 65 L52 95 M86 65 L92 95"/>
      <path d="M72 95 L62 135 L82 135 L72 95"/>`,
          `<path d="M52 95 L48 115" stroke="${muscle}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M92 95 L96 115" stroke="${muscle}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="72" cy="38" rx="11" ry="13"/>
      <path d="M72 51 L72 95"/>
      <path d="M72 58 L58 65 M72 58 L86 65"/>
      <path d="M58 65 L45 42 M86 65 L99 42"/>
      <path d="M72 95 L62 135 L82 135 L72 95"/>`,
            `<path d="M45 42 L38 32" stroke="${muscle}" stroke-width="6" fill="none"/>
      <path d="M99 42 L106 32" stroke="${muscle}" stroke-width="6" fill="none"/>
      <ellipse cx="72" cy="62" rx="18" ry="8"/>`,
          ),
        ),
    ),
  stretch: () =>
    svgWrap(
      "Stretch",
      panel(
        50,
        figure(
          `<ellipse cx="120" cy="42" rx="12" ry="14"/>
      <path d="M120 56 L120 95"/>
      <path d="M120 65 L95 72 M120 65 L145 72"/>
      <path d="M120 95 L105 130 L135 130 L120 95"/>
      <path d="M105 130 L95 155 L135 155 L125 130"/>`,
          `<path d="M95 72 L75 88" stroke="${muscle}" stroke-width="5" fill="none"/>
      <ellipse cx="115" cy="108" rx="24" ry="8" opacity="0.5"/>`,
        ),
      ),
    ),
  "cat-cow": () =>
    svgWrap(
      "Cat-cow",
      panel(
        8,
        figure(
          `<ellipse cx="200" cy="88" rx="11" ry="13"/>
      <path d="M180 95 L140 102 L95 108"/>
      <path d="M188 97 L188 112 L204 112"/>
      <path d="M95 108 L55 118 L25 122"/>
      <path d="M25 122 L15 128" stroke="${grayDark}" fill="none"/>`,
          `<path d="M95 108 Q140 95 185 102" stroke="${muscle}" stroke-width="4" fill="none"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="200" cy="78" rx="11" ry="13"/>
      <path d="M180 85 L140 95 L95 105"/>
      <path d="M188 87 L188 102 L204 102"/>
      <path d="M95 105 L55 112 L25 115"/>
      <path d="M25 115 L12 108" stroke="${grayDark}" fill="none"/>`,
            `<path d="M95 105 Q140 118 185 95" stroke="${muscle}" stroke-width="4" fill="none"/>`,
          ),
        ),
    ),
  "bird-dog": () =>
    svgWrap(
      "Bird-dog",
      panel(
        30,
        figure(
          `<ellipse cx="200" cy="92" rx="11" ry="13"/>
      <path d="M180 98 L140 105 L95 110"/>
      <path d="M188 100 L188 115 L204 115"/>
      <path d="M95 110 L55 118 L25 120"/>
      <path d="M188 100 L215 75"/>
      <path d="M95 110 L68 85"/>`,
          `<path d="M215 75 L235 62" stroke="${muscle}" stroke-width="5" fill="none"/>
      <path d="M68 85 L48 72" stroke="${muscle}" stroke-width="5" fill="none"/>`,
        ),
      ),
    ),
  "glute-bridge": () =>
    svgWrap(
      "Glute bridge",
      panel(
        8,
        figure(
          `<ellipse cx="200" cy="105" rx="11" ry="13"/>
      <path d="M180 110 L140 118 L95 122"/>
      <path d="M95 122 L55 128 L25 130"/>
      <path d="M188 112 L188 128 L204 128"/>`,
          `<ellipse cx="130" cy="118" rx="12" ry="8"/>`,
        ),
      ) +
        panel(
          168,
          figure(
            `<ellipse cx="200" cy="95" rx="11" ry="13"/>
      <path d="M180 100 L140 108 L95 112"/>
      <path d="M95 112 L55 105 L25 98"/>
      <path d="M188 102 L188 118 L204 118"/>`,
            `<ellipse cx="130" cy="102" rx="28" ry="14"/>
      <ellipse cx="55" cy="100" rx="10" ry="8"/>
      <ellipse cx="185" cy="100" rx="10" ry="8"/>`,
          ),
        ),
    ),
  superman: () =>
    svgWrap(
      "Superman",
      panel(
        30,
        figure(
          `<ellipse cx="120" cy="95" rx="11" ry="13"/>
      <path d="M120 82 L120 55"/>
      <path d="M120 108 L95 118 L55 125"/>
      <path d="M120 108 L145 118 L185 125"/>
      <path d="M120 55 L95 48 M120 55 L145 48"/>`,
          `<ellipse cx="120" cy="78" rx="14" ry="8"/>
      <path d="M95 48 L75 38" stroke="${muscle}" stroke-width="5" fill="none"/>
      <path d="M145 48 L165 38" stroke="${muscle}" stroke-width="5" fill="none"/>
      <path d="M55 125 L35 115" stroke="${muscle}" stroke-width="5" fill="none"/>
      <path d="M185 125 L205 115" stroke="${muscle}" stroke-width="5" fill="none"/>`,
        ),
      ),
    ),
};

for (const [slug, build] of Object.entries(defs)) {
  const file = path.join(outDir, `${slug}.svg`);
  fs.writeFileSync(file, build());
  console.log("wrote", file);
}
