// Loads content/projects.json (an array) as the `projects` global.
//
// - Entries with "published": false are not shown.
// - Image filenames are rewritten to .webp to match the optimized build output.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { webpName } from "../../lib/images.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function () {
    const raw = readFileSync(join(__dirname, "../../content/projects.json"), "utf-8");
    return JSON.parse(raw)
        .filter((p) => p.published !== false)
        .map((p) => ({ ...p, image: p.image ? webpName(p.image) : null }));
}
