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

## Logo options (review only)

The logo options are drawn in code in `src/_data/logo.js`. For review, the
home page is built once per option (A at `/`, the others at `/b/` and `/e/`)
and again with black and white swapped (add `dark/`: `/dark/`, `/b/dark/`,
`/e/dark/`). The small bar at the bottom of each page
(`src/_includes/switch.njk`) flips between logos and page colors, and
`/logos/` (`src/logos.njk`) shows the logos side by side.

Once a logo and page color are chosen: delete the other entries from
`variants` in `logo.js`, give the remaining one `path: "/"`, cut `pages` down
to the chosen color, and delete `src/logos.njk` and the switcher include (and
its line in `src/_includes/base.njk`). The black-page colors are the
`html[data-theme='dark']` rules at the top of `src/style.css`.

## Where things live

| What | Where |
| --- | --- |
| Projects | `content/projects.json`, `images/` |
| The numbered stages and the six questions | `src/_data/offer.json` |
| Company name, phone, address, email | `src/_data/site.json` |
| Page layout and remaining copy | `src/index.njk` |
| Header, footer, meta tags | `src/_includes/base.njk` |
| Colors and fonts (brand tokens) | `src/style.css` |
| Projects script, favicon, robots.txt | `public/` |
