# Inside Congress

A visual guide to the U.S. Congress. Read about the two chambers, separate the wings of the Capitol, compare two versions of a bill, or try the voting thresholds for ordinary passage and a veto override.

## Run locally

```sh
npm ci
npm run build
python -m http.server 8000
```

Open [the local site](http://localhost:8000). The site uses HTML and CSS for the reading experience, TypeScript for interactions, and Three.js for the architectural model. The local fonts, photos, and interactive assets are served from this repository. The Capitol also has illustrated controls for browsers without WebGL.

Run `npm run check` to type-check the source. Run `npm run vendor` after updating Three.js to regenerate its local bundle.

## Publish

GitHub Pages serves the root of `gh-pages`. Keep it in sync with the release on `main`. The build emits browser modules into `scripts/` and versions their references in `index.html`. Both are checked in so Pages can serve the site directly.

Photo credits and official civics references are in the site’s field guide. The model in `assets/capitol/capitol.glb` has separately named wings, center, and base. Four transparent renders of those groups provide the matching illustration.
