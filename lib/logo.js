// The Reel Capital Entertainment logo, drawn from the letter outlines in
// logo-outlines.js. Used by the site (src/_data/logo.js) and by the script
// that writes the downloadable files (scripts/make-logos.mjs).

import outlines from "./logo-outlines.js";

const { unitsPerEm: EM, capHeight: CAP, words } = outlines;
const n = (v) => Math.round(v * 100) / 100;

export const NAME = "Reel Capital Entertainment";
export const COLORS = { black: "#0b0b0b", white: "#ffffff", red: "#e4002b" };

// One word as path data, with its ink starting at `x`, its baseline at
// `baseline`, and letters `size` units tall per em.
function wordPath(word, x, baseline, size) {
    const s = size / EM;
    const { ink, commands } = words[word];
    return commands
        .map(([letter, ...v]) => letter + v.map((c, k) => n(k % 2 === 0 ? x + (c - ink[0]) * s : baseline - c * s)).join(" "))
        .join("");
}

// How far the ink of a word dips below its baseline (round letters do).
const dip = (word, size) => (-Math.min(0, ...words[word].commands.flatMap(([, ...v]) => v.filter((_, k) => k % 2))) * size) / EM;

// The reel: a disc with a hub hole and six round holes. Only its left three
// quarters are drawn, as if the rest were tucked behind the letter to its
// right. `size` is the full diameter; the path needs the evenodd fill rule.
const REEL_SHOWING = 0.75;
const REEL_AIR = 0.05; // sliver of space between the reel and the letter, as a share of its diameter
function reelPath(x, y, size) {
    const u = size / 100;
    const X = (v) => n(x + v * u);
    const Y = (v) => n(y + v * u);
    const R = (v) => n(v * u);
    const circle = (cx, cy, r) => `M${X(cx - r)} ${Y(cy)}a${R(r)} ${R(r)} 0 1 0 ${R(2 * r)} 0a${R(r)} ${R(r)} 0 1 0 ${R(-2 * r)} 0Z`;
    // A circle cut off by the straight edge: the part to the left of it.
    const cut = (cx, cy, r, large) => {
        const edge = 100 * REEL_SHOWING;
        const h = Math.sqrt(r * r - (edge - cx) ** 2);
        return `M${X(edge)} ${Y(cy - h)}A${R(r)} ${R(r)} 0 ${large} 0 ${X(edge)} ${Y(cy + h)}Z`;
    };
    let d = cut(50, 50, 50, 1) + circle(50, 50, 6.5);
    for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        const cx = 50 + 29 * Math.cos(a);
        const cy = 50 + 29 * Math.sin(a);
        d += cx + 9.5 > 100 * REEL_SHOWING ? cut(cx, cy, 9.5, 0) : circle(cx, cy, 9.5);
    }
    return d;
}

// The title block: words stacked and sized so every line is the same width,
// with the reel, as tall as the whole block, coming out from behind its left edge.
function block(lines) {
    const textWidth = 1000;
    const gap = 31.5;
    const sizes = lines.map((word) => (textWidth * EM) / (words[word].ink[1] - words[word].ink[0]));
    const caps = sizes.map((size) => (size * CAP) / EM);
    const height = caps.reduce((sum, cap) => sum + cap, 0) + gap * (lines.length - 1); // top of the first line to the last baseline
    const left = height * (REEL_SHOWING + REEL_AIR); // where the words start
    let y = 0;
    let bottom = 0;
    let d = "";
    lines.forEach((word, i) => {
        y += (i ? gap : 0) + caps[i];
        bottom = y + dip(word, sizes[i]);
        d += wordPath(word, left, y, sizes[i]);
    });
    return { width: n(left + textWidth), height: n(bottom), d, reel: reelPath(0, 0, height) };
}

// A shape's paths in one color.
const paths = (shape, fill) =>
    `<path fill="${fill}" d="${shape.d}"/>` + (shape.reel ? `<path fill="${fill}" fill-rule="evenodd" d="${shape.reel}"/>` : "");

export const FULL = block(["REEL", "CAPITAL", "ENTERTAINMENT"]);
export const SHORT = block(["REEL", "CAPITAL"]);

// The square icon: RC, centered.
const ICON_SIZE = 1000;
const ICON_D = (() => {
    const size = 800;
    const ink = ((words.RC.ink[1] - words.RC.ink[0]) * size) / EM;
    const cap = (size * CAP) / EM;
    return wordPath("RC", (ICON_SIZE - ink) / 2, (ICON_SIZE + cap) / 2, size);
})();

// ---------- For the site: inline, takes the color of the text around it ----------

export const inline = (shape, cls = "") =>
    `<svg viewBox="0 0 ${shape.width} ${shape.height}" class="${cls}" aria-hidden="true">${paths(shape, "currentColor")}</svg>`;

// ---------- For files: standalone SVG documents ----------

const doc = (width, height, body, pixels) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${pixels ?? width}" height="${n(((pixels ?? width) * height) / width)}">` +
    `<title>${NAME}</title>${body}</svg>\n`;

// A logo on a transparent background.
export const logoFile = (shape, color, pixels) => doc(shape.width, shape.height, paths(shape, color), pixels);

// The icon: letters on a solid square.
export const iconFile = (background, color, pixels) =>
    doc(ICON_SIZE, ICON_SIZE, `<rect width="${ICON_SIZE}" height="${ICON_SIZE}" fill="${background}"/><path fill="${color}" d="${ICON_D}"/>`, pixels);

// A logo with a solid background and a margin, for places that may change
// the color behind a picture (mail apps in dark mode).
export function paddedFile(shape, color, background, pixels) {
    const margin = shape.width * 0.12;
    const width = shape.width + margin * 2;
    const height = shape.height + margin * 2;
    return doc(
        n(width),
        n(height),
        `<rect width="${n(width)}" height="${n(height)}" fill="${background}"/><g transform="translate(${n(margin)} ${n(margin)})">${paths(shape, color)}</g>`,
        pixels
    );
}

// ---------- The media kit: every downloadable file, in page order ----------
//
// Each item is one drawing saved as `<file>.svg` and/or `<file>.png` in
// public/media/. `on` is the background its preview sits on.

const B = COLORS.black;
const W = COLORS.white;
const R = COLORS.red;
const LOGO_PX = 2000;

export const kit = [
    {
        title: "Logo",
        note: "The full logo. Use this one wherever there is room for it.",
        items: [
            { label: "Black", on: "white", file: "reel-capital-entertainment-logo-black", formats: ["svg", "png"], draw: (px) => logoFile(FULL, B, px), pixels: LOGO_PX },
            { label: "White", on: "black", file: "reel-capital-entertainment-logo-white", formats: ["svg", "png"], draw: (px) => logoFile(FULL, W, px), pixels: LOGO_PX },
            { label: "Red", on: "white", file: "reel-capital-entertainment-logo-red", formats: ["svg", "png"], draw: (px) => logoFile(FULL, R, px), pixels: LOGO_PX },
        ],
    },
    {
        title: "Short logo",
        note: "For small spaces, where the word ENTERTAINMENT would be too small to read. It is the one at the top of this site.",
        items: [
            { label: "Black", on: "white", file: "reel-capital-logo-short-black", formats: ["svg", "png"], draw: (px) => logoFile(SHORT, B, px), pixels: LOGO_PX },
            { label: "White", on: "black", file: "reel-capital-logo-short-white", formats: ["svg", "png"], draw: (px) => logoFile(SHORT, W, px), pixels: LOGO_PX },
            { label: "Red", on: "white", file: "reel-capital-logo-short-red", formats: ["svg", "png"], draw: (px) => logoFile(SHORT, R, px), pixels: LOGO_PX },
        ],
    },
    {
        title: "Icon",
        note: "For profile pictures, app icons and anywhere else the logo has to fit in a square.",
        items: [
            { label: "On black", on: "white", file: "reel-capital-icon-black", formats: ["svg", "png"], draw: (px) => iconFile(B, W, px), pixels: 1024 },
            { label: "On red", on: "white", file: "reel-capital-icon-red", formats: ["svg", "png"], draw: (px) => iconFile(R, W, px), pixels: 1024 },
            { label: "On white", on: "white", file: "reel-capital-icon-white", formats: ["svg", "png"], draw: (px) => iconFile(W, B, px), pixels: 1024 },
        ],
    },
    {
        title: "Ready to use",
        note: "The full logo on a solid white background, with space around it. Drop it straight into emails, documents and slides; it stays readable whatever is behind it.",
        items: [
            { label: "Logo on white", on: "white", file: "reel-capital-entertainment-logo-on-white", formats: ["png"], draw: (px) => paddedFile(FULL, B, W, px), pixels: 1200 },
        ],
    },
];

export const ZIP = "reel-capital-entertainment-media-kit.zip";
