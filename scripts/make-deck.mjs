// Writes the deck on its own, without building the rest of the site.
// Run with `bun run deck`. A normal build (and the dev server) already does
// this; the script is for checking the deck quickly while changing lib/deck.js.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DECK, makeDeck } from "../lib/deck.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] ?? join(root, "_site", "media", DECK);
const { pages } = await makeDeck(out);
console.log(`Wrote the ${pages}-slide deck to ${out}`);
