# ReelCapitalEntertainment.com

Public site for Reel Capital Entertainment. Same stack as the Stars & Garters
site: Eleventy 3 + Tailwind 4, built to `_site/`, intended for Vercel.

```bash
bun install
```

```bash
bun run dev
```

Dev server: http://localhost:5174

```bash
bun run build
```

## Adding a project

Projects are the array in `content/projects.json`, shown one at a time in file
order. Only `title` is required; any field left out simply does not render.

```json
{
    "title": "Film Title",
    "year": 2026,
    "genre": "Thriller",
    "status": "In production",
    "logline": "One or two sentences.",
    "director": "Name",
    "cast": ["Name", "Name"],
    "image": "Film Title.jpg",
    "imageCredit": "Who the picture belongs to",
    "contribution": {
        "role": "Gap financing",
        "amount": "$750K",
        "detail": "One sentence on what we did.",
        "credits": ["Executive Producer: Name"]
    },
    "links": [
        { "label": "IMDb", "url": "https://..." },
        { "label": "Trailer", "url": "https://..." }
    ],
    "press": [
        { "outlet": "Deadline", "title": "Headline or short description", "url": "https://..." }
    ]
}
```

- **Image:** drop a JPG, PNG or WebP of any size into `images/` and put its
  filename in `image`. It shows in a 16:9 frame (wide pictures work best; tall
  posters get cropped) and the build converts it to a resized WebP.
  `imageCredit` prints as "Image: ..." underneath.
- **Contribution:** the "Our role" line in a film's details. Each of `role`,
  `amount`, `detail` and `credits` is optional, so a film can show everything,
  just the kind of financing, just a credit, or nothing (leave `contribution`
  out and the film is simply listed). Whatever is in this file is public, so
  anything we don't want shown should not be typed here at all.
- **Links vs. press:** `links` are the film's own destinations (IMDb, trailer,
  official site, where to watch). `press` is coverage elsewhere on the web and
  shows as an "In the press" list; add as many as you like, in the order they
  should appear.
- **`"published": false`** hides an entry without deleting it.

## Logo and media kit

The logo is the stacked title block, with a six-hole reel as tall as the
block coming out from behind its left edge (the square RC icon has no reel). It is drawn in `lib/logo.js` from letter
outlines taken from Big Shoulders (`lib/logo-outlines.js`), so it does not
depend on a web font. The site uses it inline: the short two-line version in
the header and the full one in the footer.

`/media-kit/` (`src/media-kit.njk`, linked from the footer) offers the logo
for download. The files live in `public/media/` and are listed in `kit` in
`lib/logo.js`. After changing the logo or that list, rewrite them (and the
browser-tab icons in `public/`) with:

```bash
bun run logos
```

Then commit the changed files.

## The deck

The Reel Capital Entertainment deck is a PDF for sending to people. It is
drawn by `lib/deck.js` from the same content as the site
(`content/projects.json`, `src/_data/offer.json`, `src/_data/site.json`), in
the same type and colors, with one slide for each project.

Every build writes a fresh copy to `/media/reel-capital-entertainment-deck.pdf`,
which the media kit page links to. So adding or changing a project updates
the deck as soon as the change is deployed; there is nothing to run by hand
and the PDF is not committed.

To look at the deck without building the site:

```bash
bun run deck
```

That writes it to `_site/media/`. If a section is added to or removed from
the site, make the same change to the slides in `lib/deck.js`.

## Where things live

| What | Where |
| --- | --- |
| Projects | `content/projects.json`, `images/` |
| How we work, the six questions and the investor section | `src/_data/offer.json` |
| Company name, phone, address, email | `src/_data/site.json` |
| Page layout and remaining copy | `src/index.njk` |
| Header, footer, meta tags | `src/_includes/base.njk` |
| Logo drawing and download list | `lib/logo.js` |
| Media kit page and its files | `src/media-kit.njk`, `public/media/` |
| Colors and fonts (brand tokens) | `src/style.css` |
| Projects script, browser-tab icons, robots.txt | `public/` |
