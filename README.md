# vincent-redex.github.io

Source for **[vincent-redex.github.io](https://vincent-redex.github.io)** — the personal site of
Rao Sahil ([@VINCENT-REDEX](https://github.com/VINCENT-REDEX)).

Hand-written HTML, CSS and about 5 KB of JavaScript. No framework, no build step, no trackers.

## Structure

```
index.html          single-page site (hero, work, focus, stack, about, contact)
404.html            custom not-found page (served automatically by GitHub Pages)
assets/style.css    all styles; design tokens live at the top
assets/main.js      progressive enhancement only — the page works without it
assets/og.png       1200×630 social preview card
assets/icon-*.png   home-screen icons
favicon.svg         favicon
robots.txt          crawler rules + sitemap reference
sitemap.xml         single-URL sitemap
site.webmanifest    installable-web-app metadata
.nojekyll           skip Jekyll processing
```

## Local preview

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. Any static file server works.

## Notes

- GitHub Pages serves this repository from the root of `main`.
- The project cards fetch star counts and last-push dates from the public GitHub API
  (`/repos/VINCENT-REDEX/<name>`), cache them in `sessionStorage` for an hour, and silently
  keep the static values in the markup if the request fails or the rate limit is hit.
- To change the colour scheme, edit the custom properties in `:root` in `assets/style.css`.
- `?v=N` on the stylesheet and script links is a manual cache-buster — bump it when either
  file changes.
