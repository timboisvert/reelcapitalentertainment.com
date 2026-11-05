// The logo options, drawn in code. Everything is one flat color (currentColor)
// so the same drawing works on white, black or red.
//
// `variants` drives the review versions of the site (see src/index.njk) and
// the comparison page (src/logos.njk). Once a logo is chosen, delete the
// other variants here and the switcher include.

const n = (v) => Math.round(v * 100) / 100;
const rad = (deg) => (deg * Math.PI) / 180;
const circle = (cx, cy, r) =>
    `M${n(cx - r)},${n(cy)}a${n(r)},${n(r)} 0 1,0 ${n(2 * r)},0a${n(r)},${n(r)} 0 1,0 ${n(-2 * r)},0Z`;

// A reel: a disc with a hub hole and a ring of round holes, in a 100 x 100 box.
function reelPath(count, dist, r, start) {
    let d = circle(50, 50, 50) + circle(50, 50, 6.5);
    for (let k = 0; k < count; k++) {
        const a = rad(start + (k * 360) / count);
        d += circle(50 + dist * Math.cos(a), 50 + dist * Math.sin(a), r);
    }
    return d;
}

const REEL_5 = reelPath(5, 28.5, 10, -90); // shown on /logos/ for comparison only
const REEL_6 = reelPath(6, 29, 9.5, 0);
const REEL_8 = reelPath(8, 31, 7.5, 22.5);

const path = (d) => `<path fill="currentColor" fill-rule="evenodd" d="${d}"/>`;
const reelSvg = (d, cls = "") => `<svg viewBox="0 0 100 100" class="${cls}" aria-hidden="true">${path(d)}</svg>`;

// A reel with only its left three quarters showing, as if the rest were
// tucked behind the letter to its right. `size` is its full diameter.
const SHOWING = 0.75;
const AIR = 0.05; // sliver of space between the reel and the letter
const tucked = (d, x, y, size) =>
    `<svg x="${n(x)}" y="${n(y)}" width="${n(size * SHOWING)}" height="${n(size)}" viewBox="0 0 ${100 * SHOWING} 100">${path(d)}</svg>`;

// Big Shoulders 900 at its display cut, measured in the browser, in ems:
// cap height, and where the ink of each piece of text starts and ends.
const CAP = 0.8;
const INK = {
    REEL: [0.04, 1.68],
    CAPITAL: [0.035, 2.8975],
    ENTERTAINMENT: [0.04, 5.986],
    "REEL CAPITAL": [0.04, 4.8125],
};
const TEXT = `font-family="Big Shoulders" font-weight="900" style="font-variation-settings:'opsz' 72" fill="currentColor"`;
const text = (word, x, y, size) => `<text x="${n(x)}" y="${n(y)}" font-size="${n(size)}" ${TEXT}>${word}</text>`;

// The words stacked and sized so every line is exactly the same width.
// `reelLine` puts a tucked reel, as tall as the letters, at the start of that line.
function stack(cls = "", { lines = ["REEL", "CAPITAL", "ENTERTAINMENT"], reelLine = -1 } = {}) {
    const width = 286.25;
    const gap = 9;
    let y = 0;
    const parts = lines.map((word, i) => {
        const [left, right] = INK[word];
        const reel = i === reelLine ? CAP * (SHOWING + AIR) : 0;
        const size = width / (right - left + reel);
        const cap = size * CAP;
        const top = y + (i ? gap : 0);
        y = top + cap;
        return (reel ? tucked(REEL_6, 0, top, cap) : "") + text(word, reel * size - left * size, y, size);
    });
    return `<svg viewBox="0 0 ${width} ${n(y + 1)}" class="${cls}" aria-hidden="true">${parts.join("")}</svg>`;
}

// The name on one line with a tucked reel in front of REEL. The drawing is
// 1em of type per 100 units, so its width in ems sets the size of the letters.
function oneLine(cls = "") {
    const size = 100;
    const cap = size * CAP;
    const [left, right] = INK["REEL CAPITAL"];
    const start = cap * (SHOWING + AIR);
    const width = start + (right - left) * size;
    const parts = tucked(REEL_6, 0, 0, cap) + text("REEL CAPITAL", start - left * size, cap, size);
    return `<svg viewBox="0 0 ${n(width)} ${cap + 1}" class="${cls}" style="width:min(100%,${n(width / size)}em)" aria-hidden="true">${parts}</svg>`;
}

const TWO_LINES = ["REEL", "CAPITAL"];
const reelIcon = (d) => () => reelSvg(d, "h-[0.72em] w-[0.72em]");

// `stacked` logos are sized by their height in the header; the others by
// their type size.
const variants = [
    {
        id: "a",
        letter: "A",
        path: "/",
        stacked: false,
        title: "Reel and name",
        note: "REEL CAPITAL on one line, with a six-hole reel coming out from behind the word REEL, three quarters of it showing. The whole reel is the small icon.",
        lockup: () => oneLine("lockup-line"),
        icon: reelIcon(REEL_6),
    },
    {
        id: "b",
        letter: "B",
        path: "/b/",
        stacked: true,
        title: "Title block",
        note: "No symbol. The three words stacked to one width, the way a title sits on a poster. The small icon is RC.",
        lockup: (small) => stack("lockup-stack", small ? { lines: TWO_LINES } : {}),
        icon: () => `<span class="font-display leading-none" style="font-weight:900;font-size:0.8em">RC</span>`,
    },
    {
        id: "e",
        letter: "E",
        path: "/e/",
        stacked: true,
        title: "Title block, reel behind REEL",
        note: "The title block, with a six-hole reel coming out from behind the word REEL, three quarters of it showing. The whole reel is the small icon.",
        lockup: (small) => stack("lockup-stack", small ? { lines: TWO_LINES, reelLine: 0 } : { reelLine: 0 }),
        icon: reelIcon(REEL_6),
    },
];

// The same reel with 5, 6 and 8 holes, for comparison on /logos/.
const reels = [
    { label: "5 holes", svg: reelSvg(REEL_5, "h-24 w-24") },
    { label: "6 holes (used in logos A and E)", svg: reelSvg(REEL_6, "h-24 w-24") },
    { label: "8 holes", svg: reelSvg(REEL_8, "h-24 w-24") },
];

// Every logo on both page colors: the site as designed (black on white), and
// the same site with black and white swapped. `base` is the white-page address.
const pages = ["light", "dark"].flatMap((theme) =>
    variants.map((v) => ({ ...v, theme, base: v.path, path: theme === "dark" ? `${v.path}dark/` : v.path }))
);

export default { variants, pages, reels };
