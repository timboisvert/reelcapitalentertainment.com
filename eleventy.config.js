import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { webpName } from "./lib/images.js";
import { DECK, makeDeck } from "./lib/deck.js";

// Pictures dropped into /images can be any size. Each is converted to a
// resized WebP in the build output so the site never serves multi-MB originals.
// Skips files whose output is already newer than the source.
async function optimizeImages(outputDir) {
    const out = path.join(outputDir, "images");
    mkdirSync(out, { recursive: true });
    const jobs = [];
    for (const file of readdirSync("images")) {
        if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
        const src = path.join("images", file);
        const dest = path.join(out, webpName(file));
        if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) continue;
        jobs.push(
            sharp(src)
                .resize({ width: 1600, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(dest)
        );
    }
    await Promise.all(jobs);
}

export default function (eleventyConfig) {
    eleventyConfig.on("eleventy.before", async ({ dir }) => {
        await optimizeImages(dir.output);
    });

    // The deck (lib/deck.js) is rebuilt from the current content on every build,
    // so it always matches the project list. The media kit page links to it.
    eleventyConfig.on("eleventy.after", async ({ dir }) => {
        await makeDeck(path.join(dir.output, "media", DECK));
    });

    // content/ and images/ live outside src/, so watch them explicitly.
    eleventyConfig.addWatchTarget("./content/");
    eleventyConfig.addWatchTarget("./images/");
    eleventyConfig.addWatchTarget("./lib/");

    // Anything in public/ is copied to the site root as-is (site.js, favicon, robots.txt).
    eleventyConfig.addPassthroughCopy({ public: "/" });

    eleventyConfig.setServerOptions({ port: 5174 });

    return {
        dir: { input: "src", output: "_site" },
    };
}
