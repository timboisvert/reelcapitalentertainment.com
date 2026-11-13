// The Reel Capital Entertainment deck: a PDF built from the same content as
// the site (content/projects.json, src/_data/offer.json, src/_data/site.json)
// in the same type and colors. eleventy.config.js writes it into the site on
// every build, so it is always in step with the project list. The media kit
// page links to it.

import { createWriteStream, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import { COLORS, FULL, SHORT } from "./logo.js";

export const DECK = "reel-capital-entertainment-deck.pdf";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const json = (file) => JSON.parse(readFileSync(join(root, file), "utf8"));
const font = (pkg, file) => require.resolve(`@fontsource/${pkg}/files/${file}.woff`);

// The site's two typefaces: Big Shoulders for headlines, Libre Franklin for text.
const FONTS = {
    black: font("big-shoulders-display", "big-shoulders-display-latin-900-normal"),
    heavy: font("big-shoulders-display", "big-shoulders-display-latin-800-normal"),
    text: font("libre-franklin", "libre-franklin-latin-400-normal"),
    medium: font("libre-franklin", "libre-franklin-latin-500-normal"),
    semi: font("libre-franklin", "libre-franklin-latin-600-normal"),
};

// A 16:9 slide, in points.
const W = 1280;
const H = 720;
const M = 56; // side margin
const TOP = 112; // where a slide's content starts, under the header
const CAP = 0.8; // cap height of the headline face, as a share of its size

const INK = COLORS.black;
const WHITE = COLORS.white;
const RED = COLORS.red;

// What a slide's background decides: the text color, a quieter text color and
// the color of thin rules.
const THEMES = {
    white: { bg: WHITE, fg: INK, muted: "#5f5c5c", rule: "#d6d3d3", accent: RED },
    black: { bg: INK, fg: WHITE, muted: "#a5a1a1", rule: "#3a3737", accent: "#ff3355" },
    red: { bg: RED, fg: WHITE, muted: "#ffd9df", rule: "#f0667f", accent: WHITE },
};

export async function makeDeck(file) {
    const site = json("src/_data/site.json");
    const offer = json("src/_data/offer.json");
    const projects = json("content/projects.json").filter((p) => p.published !== false);

    const doc = new PDFDocument({
        size: [W, H],
        margin: 0,
        autoFirstPage: false,
        info: { Title: `${site.name} deck`, Author: site.name },
    });
    for (const [name, path] of Object.entries(FONTS)) doc.registerFont(name, path);
    mkdirSync(dirname(file), { recursive: true });
    const done = new Promise((resolve, reject) => {
        const out = createWriteStream(file);
        out.on("finish", resolve);
        out.on("error", reject);
        doc.pipe(out);
    });

    let theme = THEMES.white;
    let page = 0;
    const total = 6 + projects.length;

    // ---------- Drawing helpers ----------

    // A logo shape from lib/logo.js, `height` points tall, with its top left at x, y.
    function logo(shape, x, y, height, color) {
        const s = height / shape.height;
        doc.save().translate(x, y).scale(s);
        doc.path(shape.d).fill(color);
        if (shape.reel) doc.path(shape.reel).fill(color, "even-odd");
        doc.restore();
        return shape.width * s;
    }

    const widthOf = (text, face, size) => doc.font(face).fontSize(size).widthOfString(text);

    // Break text into lines no wider than `width`.
    function wrap(text, face, size, width) {
        const lines = [];
        let line = "";
        for (const word of text.split(/\s+/)) {
            const next = line ? `${line} ${word}` : word;
            if (line && widthOf(next, face, size) > width) {
                lines.push(line);
                line = word;
            } else {
                line = next;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    // A headline in heavy capitals. `y` is the top of the first line's letters;
    // returns the bottom of the last line's letters.
    function headline(text, x, y, { size, width = W - 2 * M, face = "heavy", leading = 0.96, color = theme.fg, lines }) {
        const rows = lines ?? wrap(text.toUpperCase(), face, size, width);
        let base = y + size * CAP;
        rows.forEach((row, i) => {
            if (i) base += size * leading;
            doc.font(face).fontSize(size).fillColor(color).text(row.toUpperCase(), x, base, { lineBreak: false, baseline: "alphabetic" });
        });
        return base;
    }

    // The largest size, up to `max`, at which every line fits in `width`.
    function fit(lines, face, width, max) {
        const widest = Math.max(...lines.map((line) => widthOf(line.toUpperCase(), face, 100)));
        return Math.min(max, (width / widest) * 100);
    }

    // Running text. Returns the y just below it.
    function para(text, x, y, width, { size = 20, face = "text", color = theme.fg, gap = 0.32 } = {}) {
        doc.font(face).fontSize(size).fillColor(color);
        doc.text(text, x, y, { width, lineGap: size * gap });
        return doc.y;
    }

    const rule = (x, y, width, { color = theme.rule, weight = 1 } = {}) =>
        doc.moveTo(x, y).lineTo(x + width, y).lineWidth(weight).strokeColor(color).stroke();

    // A new slide with the site's header: logo on the left, section name on
    // the right, and the page number at the foot.
    function slide(name, label) {
        theme = THEMES[name];
        page += 1;
        doc.addPage();
        doc.rect(0, 0, W, H).fill(theme.bg);
        if (!label) return;
        logo(SHORT, M, 24, 34, theme.fg);
        doc.font("medium").fontSize(13).fillColor(theme.fg).text(label, M, 36, { width: W - 2 * M, align: "right", lineBreak: false });
        rule(0, 80, W);
        doc.font("text").fontSize(11).fillColor(theme.muted);
        doc.text(site.url.replace(/^https?:\/\//, ""), M, H - 36, { lineBreak: false });
        doc.text(`${page} / ${total}`, M, H - 36, { width: W - 2 * M, align: "right", lineBreak: false });
    }

    // ---------- 1. Cover ----------

    slide("white");
    {
        const lines = ["Investing in", "the business of", "entertainment."];
        const size = fit(lines, "black", W - 2 * M, 172);
        headline("", M, 64, { size, face: "black", leading: 0.82, lines });
        logo(FULL, M, H - 56 - 128, 128, INK);
        const when = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
        doc.font("medium").fontSize(16).fillColor(INK).text(site.url.replace(/^https?:\/\//, ""), M, H - 56 - 44, { width: W - 2 * M, align: "right", lineBreak: false });
        doc.font("text").fontSize(16).fillColor(theme.muted).text(when, M, H - 56 - 18, { width: W - 2 * M, align: "right", lineBreak: false });
    }

    // ---------- 2. Who we are ----------

    slide("white", "Who we are");
    {
        const bottom = headline("We bring investor money to independent film.", M, TOP + 24, { size: 104, face: "black", leading: 0.86, width: 1000 });
        const y = bottom + 64;
        doc.font("medium").fontSize(15).fillColor(theme.muted).text("Our goal is twofold", M, y, { lineBreak: false });
        const goals = ["To make great movies.", "To make good money for our investors while doing it."];
        const col = (W - 2 * M - 48) / 2;
        goals.forEach((goal, i) => {
            const x = M + i * (col + 48);
            rule(x, y + 36, col, { color: theme.fg, weight: 2 });
            doc.font("black").fontSize(96).fillColor(theme.accent).text(String(i + 1), x, y + 60 + 96 * CAP, { lineBreak: false, baseline: "alphabetic" });
            headline(goal, x + 72, y + 60, { size: 40, width: col - 72, leading: 1.02 });
        });
    }

    // ---------- 3. How we work ----------

    slide("white", "How we work");
    {
        const bottom = headline(offer.howIntro, M, TOP + 8, { size: 76 });
        const col = (W - 2 * M - 48) / 2;
        const y = bottom + 48;
        offer.sides.forEach((side, i) => {
            const x = M + i * (col + 48);
            rule(x, y, col, { color: theme.fg, weight: 2 });
            doc.font("black").fontSize(120).fillColor(theme.fg).text(String(i + 1), x, y + 24 + 120 * CAP, { lineBreak: false, baseline: "alphabetic" });
            const name = headline(side.name, x, y + 24 + 120 * CAP + 36, { size: 56, width: col });
            const after = para(side.text, x, name + 22, col - 16, { size: 21 });
            para(side.items.join("   ·   "), x, after + 18, col, { size: 14.5, color: theme.muted });
        });
    }

    // ---------- 4. What we look for ----------

    slide("white", "What we look for");
    {
        const bottom = headline(offer.criteriaLead, M, TOP + 8, { size: 76 });
        const intro = para(offer.criteriaIntro, M, bottom + 24, 820, { size: 20 });
        const cols = 3;
        const gap = 40;
        const col = (W - 2 * M - gap * (cols - 1)) / cols;
        const rowHeight = (H - 44 - (intro + 34)) / Math.ceil(offer.criteria.length / cols);
        offer.criteria.forEach((c, i) => {
            const x = M + (i % cols) * (col + gap);
            const y = intro + 34 + Math.floor(i / cols) * rowHeight;
            rule(x, y, col);
            doc.font("medium").fontSize(13).fillColor(theme.muted).text(c.name, x, y + 16, { lineBreak: false });
            headline(c.text, x, y + 46, { size: 34, width: col, leading: 1.06 });
        });
    }

    // ---------- 5. One slide for each project ----------

    for (const [i, p] of projects.entries()) {
        slide("black", projects.length > 1 ? `Projects  ${i + 1} / ${projects.length}` : "Projects");
        const title = [p.title];
        const size = fit(title, "black", W - 2 * M, 150);
        const bottom = headline("", M, TOP - 4, { size, face: "black", lines: title });
        const y = bottom + 32;
        const picHeight = H - 60 - y;
        const picWidth = Math.min(Math.round((picHeight * 16) / 9), 720);
        if (p.image) {
            const picture = await sharp(join(root, "images", p.image))
                .resize({ width: Math.round(picWidth * 2), height: Math.round(picHeight * 2), fit: "cover" })
                .jpeg({ quality: 84 })
                .toBuffer();
            doc.image(picture, M, y, { width: picWidth, height: picHeight });
            if (p.imageCredit) {
                doc.font("text").fontSize(9).fillColor(theme.muted).text(`Image: ${p.imageCredit}`, M, y + picHeight + 6, { lineBreak: false });
            }
        } else {
            doc.rect(M, y, picWidth, picHeight).fill("#1a1818");
        }

        const x = M + picWidth + 48;
        const width = W - M - x;
        let at = y - 5;
        if (p.logline) at = para(p.logline, x, at, width, { size: 21, gap: 0.28 }) + 22;
        const rows = [
            ["Director", p.director],
            ["Cast", (p.cast ?? []).join(", ")],
            ["Genre", p.genre],
            ["Year", p.year],
            ["Status", p.status],
            ["Our role", [p.contribution?.role, p.contribution?.amount].filter(Boolean).join(", ")],
            ["In the press", [...new Set((p.press ?? []).map((item) => item.outlet))].join(", ")],
        ].filter(([, value]) => value);
        for (const [name, value] of rows) {
            rule(x, at, width);
            doc.font("text").fontSize(15).fillColor(theme.muted).text(name, x, at + 11, { lineBreak: false });
            at = para(String(value), x + 124, at + 11, width - 124, { size: 15, gap: 0.25 }) + 9;
        }
        rule(x, at, width);
    }

    // ---------- 6. For investors ----------

    slide("white", "For investors");
    {
        const bottom = headline(offer.investorsLead, M, TOP + 8, { size: 76 });
        const intro = para(offer.investorsIntro, M, bottom + 24, 820, { size: 20 });
        const gap = 36;
        const col = (W - 2 * M - gap * (offer.investors.length - 1)) / offer.investors.length;
        const y = intro + 52;
        offer.investors.forEach((point, i) => {
            const x = M + i * (col + gap);
            rule(x, y, col, { color: theme.fg, weight: 2 });
            const name = headline(point.name, x, y + 24, { size: 38, width: col });
            para(point.text, x, name + 18, col, { size: 17.5, gap: 0.38 });
        });
    }

    // ---------- 7. Contact ----------

    slide("red", "Contact");
    {
        const bottom = headline("Let's talk.", M, TOP + 4, { size: 190, face: "black" });
        const y = bottom + 48;
        const left = 500;
        doc.font("heavy").fontSize(30).fillColor(WHITE).text("HAVE A PROJECT?", M, y, { lineBreak: false });
        const first = para("Send us the script, the budget and who's attached. We invest and we lend, and we'll give you a straight answer.", M, y + 40, left, { size: 17 });
        doc.font("heavy").fontSize(30).fillColor(WHITE).text("WANT TO INVEST?", M, first + 22, { lineBreak: false });
        para("Call us. We'll walk you through how our funds work and what we're backing now.", M, first + 62, left, { size: 17 });

        const x = M + left + 110;
        let at = y;
        const detail = (name, value, size) => {
            doc.font("text").fontSize(13).fillColor(theme.muted).text(name, x, at, { lineBreak: false });
            doc.font("heavy").fontSize(size).fillColor(WHITE).text(value, x, at + 20 + size * CAP, { lineBreak: false, baseline: "alphabetic" });
            at += 20 + size * CAP + 30;
        };
        if (site.phone) detail("Phone", site.phone, 84);
        if (site.email) detail("Email", site.email.toUpperCase(), 40);
        if (site.addressLines?.length) {
            doc.font("text").fontSize(13).fillColor(theme.muted).text("Office", x, at, { lineBreak: false });
            para(site.addressLines.join("\n"), x, at + 20, 500, { size: 18 });
        }

        // The fine print.
        para(
            `Nothing in this document is an offer to sell, or a solicitation of an offer to buy, any security. Any financing is subject to underwriting, diligence and definitive documentation. Projects are described using publicly available information, and their details can change. © ${new Date().getFullYear()} ${site.legalName}`,
            M, H - 96, 860, { size: 10.5, color: theme.muted, gap: 0.35 }
        );
    }

    doc.end();
    await done;
    return { file, pages: page };
}
