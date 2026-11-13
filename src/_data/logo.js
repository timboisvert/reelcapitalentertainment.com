// The logo for the templates. The drawing itself lives in lib/logo.js.
import { COLORS, FULL, SHORT, ZIP, inline, kit } from "../../lib/logo.js";
import { DECK } from "../../lib/deck.js";

export default {
    // Inline drawings that take the color of the text around them.
    full: (cls = "") => inline(FULL, cls),
    short: (cls = "") => inline(SHORT, cls),

    // The media kit page: the downloadable files, the zip of all of them, and
    // the brand colors.
    kit,
    zip: ZIP,
    // The deck, written into the site by eleventy.config.js on every build.
    deck: DECK,
    // Hex and RGB are exact (they are what the site and the files use). CMYK
    // and Pantone are the closest print equivalents; white has no Pantone.
    colors: [
        { name: "Red", hex: COLORS.red, rgb: "228, 0, 43", cmyk: "0, 93, 79, 0", pantone: "185 C" },
        { name: "Black", hex: COLORS.black, rgb: "11, 11, 11", cmyk: "0, 0, 0, 100", pantone: "Black 6 C" },
        { name: "White", hex: COLORS.white, rgb: "255, 255, 255", cmyk: "0, 0, 0, 0" },
    ],
};
