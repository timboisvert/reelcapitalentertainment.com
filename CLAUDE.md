# Reel Capital Entertainment site

Read `README.md` first: it says where the content lives and how the logo,
media kit and deck are produced.

## Rules

- **The deck follows the site.** `lib/deck.js` draws the Reel Capital
  Entertainment deck (a PDF linked from `/media-kit/`) from the site's content
  on every build. Whenever the projects in `content/projects.json` change,
  generate the deck (`bun run deck`) and look at the project slides before
  finishing: a long title, a missing picture or a long cast list can break a
  slide's layout. Whenever a section of the site is added, removed or
  reworded in the templates rather than the data files, make the same change
  in `lib/deck.js`.
- **Same look everywhere.** The deck and the media kit use the site's type
  (Big Shoulders for headlines, Libre Franklin for text), its colors (red
  `#e4002b`, black `#0b0b0b`, white) and the logo from `lib/logo.js`. Don't
  introduce other fonts or colors.
- **After changing the logo**, run `bun run logos` and commit the files it
  rewrites in `public/`.
