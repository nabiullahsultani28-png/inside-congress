import { showPlates } from "./plate-viewer.js";
import { wireCapitolPlate } from "./capitol-plate.js";
import { wireReading } from "./reading.js";
import { readSeats, animateSeats } from "./seat-transition.js";
import { icon, intro, page, related, sources } from "./exhibit-kit.js";
import { chamberContent, wireChamber } from "./chambers.js";
import { wireVoteLab } from "./vote-lab.js";
import { billContent, wireBill } from "./bill.js";
import { guideContent, powersContent } from "./field-guide.js";
const home = document.querySelector("#home-view");
const exhibit = document.querySelector("#exhibit-view");
const main = document.querySelector("#main-content");
const nav = document.querySelector("#nav");
const menu = document.querySelector(".menu-toggle");
const masthead = document.querySelector(".masthead");
const navLinks = [...document.querySelectorAll("[data-nav]")];
const anchors = ["exhibits", "building", "representation", "lawmaking", "congress-powers"];
const titles = {
    home: "How Congress works",
    capitol: "The U.S. Capitol in 3D",
    chambers: "The House and Senate",
    bill: "How a bill becomes law",
    powers: "What powers does Congress have?",
    guide: "Field guide",
};
let activeView;
let lifecycle = new AbortController();
function setMenu(open) {
    nav.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.innerHTML = icon(open ? "close" : "menu");
}
menu.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        menu.focus();
    }
});
document.addEventListener("click", (event) => {
    const target = event.target;
    const link = target.closest("a");
    if (nav.classList.contains("open") && (link || !event.composedPath().includes(masthead)))
        setMenu(false);
    if (link && link.hash && link.hash === location.hash && link.origin === location.origin &&
        link.pathname === location.pathname && (link.hash === "#home" || anchors.includes(link.hash.slice(1)))) {
        event.preventDefault();
        route();
    }
});
matchMedia("(min-width: 901px)").addEventListener("change", ({ matches }) => {
    if (matches)
        setMenu(false);
});
function viewerContent() {
    const commands = [
        ["left", "left", "Rotate left"],
        ["right", "right", "Rotate right"],
        ["out", "minus", "Zoom out"],
        ["in", "plus", "Zoom in"],
        ["reset", "reset", "Reset view"],
    ];
    const buttons = commands.map(([action, symbol, label]) => `<button type="button" disabled class="ghost-button" data-camera="${action}" aria-label="${label}" title="${label}">${icon(symbol)}</button>`).join("");
    return page("The Capitol in 3D", intro("Architecture", "The U.S. Capitol in 3D", "Take a closer look at the dome, porticoes and wings. Select a wing on the model or use the links below to explore the chamber inside.") +
        `<figure class="viewer">
      <div class="viewer-stage" tabindex="0" role="group" aria-label="Interactive Capitol model" aria-describedby="viewer-keys">
        <img class="viewer-photo" src="assets/capitol/capitol.webp" alt="Architectural model of the west front of the U.S. Capitol">
        <canvas class="viewer-canvas" aria-label="Rotatable 3D Capitol"></canvas>
      </div>
      <figcaption class="viewer-bar">
        <p class="viewer-status" role="status">Opening the 3D model…</p>
        <div class="viewer-controls" role="group" aria-label="Model and camera controls">
          <button type="button" class="ghost-button drawing-button" data-drawing aria-pressed="false" disabled>Line drawing</button>${buttons}
        </div>
      </figcaption>
    </figure>
    <p id="viewer-keys" class="sr-only">Use left and right arrow keys to rotate, up and down to zoom, and Home to reset the camera.</p>
    <section class="viewer-layout">
      <div class="viewer-text"><h2>Look for the two wings</h2><p>Look toward the west front. The Senate is on the left and the House is on the right. The dome marks the Rotunda between them.</p><p class="source-note">Architecture reference · <a href="${sources.capitol}">Architect of the Capitol</a></p></div>
      <nav class="model-wing-links" aria-label="Explore a chamber"><a class="button light-button" href="#chambers/senate">Visit the Senate</a><a class="button primary-button" href="#chambers/house">Visit the House</a></nav>
    </section>` + related("See how the building fits together", "Return to the model", "#building"));
}
function route(initial = false) {
    const [fragment = "", detail = ""] = location.hash.slice(1).split("/");
    if (fragment === "main-content" && !initial) {
        main.focus();
        return;
    }
    const view = (Object.hasOwn(titles, fragment) ? fragment : "home");
    const previous = activeView;
    activeView = view;
    const section = anchors.includes(fragment) ? document.getElementById(fragment) : null;
    setMenu(false);
    home.hidden = view !== "home";
    exhibit.hidden = view === "home";
    navLinks.forEach((link) => {
        if (link.dataset.nav === view || (fragment === "building" && link.dataset.nav === "capitol")) {
            link.setAttribute("aria-current", view === "home" ? "location" : "page");
        }
        else {
            link.removeAttribute("aria-current");
        }
    });
    document.title = view === "home" ? "Inside Congress — How Congress works" : titles[view] + " · Inside Congress";
    if (view !== previous || view !== "home") {
        lifecycle.abort();
        lifecycle = new AbortController();
    }
    const { signal } = lifecycle;
    if (view === "home") {
        exhibit.replaceChildren();
        if (previous !== "home") {
            wireReading(home, signal);
            wireCapitolPlate(home.querySelector("[data-capitol-plate]"), signal);
        }
        if (section) {
            section.focus({ preventScroll: true });
            section.scrollIntoView({ block: "start" });
        }
        else {
            window.scrollTo(0, 0);
            if (!initial)
                main.focus({ preventScroll: true });
        }
        return;
    }
    if (view === "chambers") {
        const key = detail === "senate" ? "senate" : "house";
        const oldSeats = previous === "chambers" ? readSeats(exhibit) : [];
        exhibit.innerHTML = chamberContent(key);
        wireChamber(exhibit, key, signal);
        wireVoteLab(exhibit, signal);
        animateSeats(exhibit, oldSeats);
    }
    else if (view === "bill") {
        exhibit.innerHTML = billContent();
        wireBill(exhibit, signal);
    }
    else if (view === "powers") {
        const key = detail === "oversight" || detail === "confirmations" ? detail : "spending";
        exhibit.innerHTML = powersContent(key);
    }
    else if (view === "guide") {
        exhibit.innerHTML = guideContent(detail === "credits");
    }
    else {
        exhibit.innerHTML = viewerContent();
        const viewer = exhibit.querySelector(".viewer");
        const canvas = viewer.querySelector("canvas");
        const context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" });
        if (!context)
            showPlates(viewer, signal);
        else {
            import("./capitol.js").then(({ showCapitol }) => {
                if (!signal.aborted)
                    return showCapitol(viewer, context, signal);
            }).catch(() => showPlates(viewer, signal));
        }
    }
    if (view === "guide" && detail === "credits") {
        const credits = exhibit.querySelector("#source-collection");
        credits.focus({ preventScroll: true });
        credits.scrollIntoView({ block: "start" });
    }
    else if (!initial && previous === view && (view === "chambers" || view === "powers")) {
        exhibit.querySelector('.switch-link[aria-current="page"]')?.focus({ preventScroll: true });
    }
    else {
        window.scrollTo(0, 0);
        if (!initial)
            exhibit.querySelector("h1")?.focus({ preventScroll: true });
    }
}
document.querySelector(".skip").addEventListener("click", (event) => {
    event.preventDefault();
    main.focus();
});
window.addEventListener("hashchange", () => route());
route(true);
