# Inside Congress

An interactive civics museum built for the web. Explore a three-dimensional Capitol, compare representation in the House and Senate, and follow a fictional library grant bill through Congress. The field guide includes official sources, image credits, and links for following real legislation.

## Run locally

Serve the repository root with any static HTTP server. With Python installed, run `python -m http.server 8000` and open `http://localhost:8000`. The site ships its fonts, imagery, and three-dimensional model locally.

## GitHub Pages

In **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**. GitHub Pages serves the checked-in HTML, CSS, JavaScript, and assets directly. Relative asset URLs and hash-based exhibit links work under a repository subpath.

## Source and assets

The `scripts` directory contains the exhibit interactions and renderer. The `assets` directory contains the original Capitol model and rendering, credited archival images, local fonts, and a browser bundle of Three.js r173 with its glTF loader and orbit controls. Dependency and font licenses are included next to the respective files. Photography credits and official references are in the site's field guide.
