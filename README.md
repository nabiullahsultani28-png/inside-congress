# Inside Congress

An interactive civics museum built for the web. Explore a three-dimensional Capitol, compare representation in the House and Senate, and follow a fictional library grant bill through Congress. The field guide includes official sources, image credits, and links for following real legislation.

## Run locally

Serve the repository root with any static HTTP server. With Python installed, run `python -m http.server 8000` and open `http://localhost:8000`. The site ships its fonts, imagery, and three-dimensional model locally.

## GitHub Pages

The live site is published from the root of the **gh-pages** branch. Keep that branch in sync with the release on **main**. All runtime assets use relative paths.

## Build the TypeScript interactions

Run `npm ci`, then `npm run build`. The editable TypeScript is in `src/`. Compiled browser modules live in `scripts/` and are checked in so Pages can serve them directly. Run `npm run check` to type-check without emitting files. The guided camera tour renders the Capitol with Three.js, with three matching stills for the WebGL fallback. In the free-orbit viewer, **Line drawing** traces the model’s cornices and columns using instanced feature edges. Run `npm run vendor` after updating Three.js to regenerate the local bundle. The bill walkthrough and chamber seat transitions use the same reduced-motion preference as the camera tour.

## Source and assets

The `scripts` directory contains the exhibit interactions and renderer. The `assets` directory contains the original Capitol model and rendering, credited archival images, local fonts, and a browser bundle of Three.js r173 with its glTF loader and orbit controls. Dependency and font licenses are included next to the respective files. Photography credits and official references are in the site's field guide.
