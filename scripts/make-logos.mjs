// Writes the downloadable logo files for the media kit into public/media/,
// plus the browser-tab icons into public/. Run with `bun run logos` after
// changing lib/logo.js; the files it writes are committed.

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { COLORS, ZIP, iconFile, kit } from "../lib/logo.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const media = join(root, "public", "media");
const png = (svg) => sharp(Buffer.from(svg)).png().toBuffer();

rmSync(media, { recursive: true, force: true });
mkdirSync(media, { recursive: true });

for (const group of kit) {
    for (const item of group.items) {
        if (item.formats.includes("svg")) writeFileSync(join(media, `${item.file}.svg`), item.draw());
        if (item.formats.includes("png")) writeFileSync(join(media, `${item.file}.png`), await png(item.draw(item.pixels)));
    }
}

// Everything in one download.
const files = readdirSync(media).sort();
execFileSync("zip", ["-q", "-j", "-X", join(media, ZIP), ...files.map((f) => join(media, f))]);

// Browser-tab icons: the RC icon on black.
const icon = (px) => iconFile(COLORS.black, COLORS.white, px);
writeFileSync(join(root, "public", "favicon.svg"), icon());
writeFileSync(join(root, "public", "apple-touch-icon.png"), await png(icon(180)));

// favicon.ico: a 32-pixel PNG in an .ico wrapper.
const small = await png(icon(32));
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt16LE(1, 10); // color planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(small.length, 14);
header.writeUInt32LE(22, 18); // where the image starts
writeFileSync(join(root, "public", "favicon.ico"), Buffer.concat([header, small]));

console.log(`Wrote ${files.length} files and ${ZIP} to public/media/, and the browser-tab icons to public/.`);
