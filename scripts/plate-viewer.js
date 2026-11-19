const plates = [
    ["west", "West front", "The dome rises between the Senate and House wings."],
    ["north", "Senate wing", "The north portico fronts the Senate wing."],
    ["south", "House wing", "The south portico fronts the House wing."],
];
// Sobel edges from the lit architectural plate retain windows, columns and the outer silhouette.
function trace(image, canvas) {
    const width = Math.min(1100, image.naturalWidth), height = Math.round((width * image.naturalHeight) / image.naturalWidth);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx)
        return;
    ctx.drawImage(image, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height), pixels = data.data;
    const light = new Float32Array(width * height);
    for (let i = 0; i < light.length; i++) {
        const n = i * 4;
        light[i] =
            ((0.2126 * pixels[n] + 0.7152 * pixels[n + 1] + 0.0722 * pixels[n + 2]) *
                pixels[n + 3]) /
                255;
    }
    for (let y = 1; y < height - 1; y++)
        for (let x = 1; x < width - 1; x++) {
            const i = y * width + x, n = i * 4;
            if (!pixels[n + 3])
                continue;
            const gx = light[i - width + 1] +
                2 * light[i + 1] +
                light[i + width + 1] -
                light[i - width - 1] -
                2 * light[i - 1] -
                light[i + width - 1];
            const gy = light[i + width - 1] +
                2 * light[i + width] +
                light[i + width + 1] -
                light[i - width - 1] -
                2 * light[i - width] -
                light[i - width + 1];
            const edge = Math.min(1, Math.max(0, (Math.abs(gx) + Math.abs(gy) - 35) / 155));
            pixels[n] = 34 + edge * 210;
            pixels[n + 1] = 52 + edge * 151;
            pixels[n + 2] = 61 + edge * 92;
        }
    ctx.putImageData(data, 0, 0);
}
export function showPlates(viewer, signal) {
    if (signal.aborted || viewer.classList.contains("has-plates"))
        return;
    viewer.classList.add("has-plates");
    viewer.classList.remove("has-model");
    const stage = viewer.querySelector(".viewer-stage"), photo = viewer.querySelector(".viewer-photo");
    const status = viewer.querySelector(".viewer-status"), group = viewer.querySelector(".viewer-controls");
    const toggle = group.querySelector("[data-drawing]");
    const original = stage.querySelector(".viewer-canvas");
    original.hidden = true;
    group.hidden = false;
    stage.tabIndex = 0;
    const instructions = document.getElementById("viewer-keys");
    if (instructions)
        instructions.textContent = "Use left and right arrows to change views, up and down to zoom, and Home to reset.";
    stage.setAttribute("aria-label", "Capitol architectural views");
    const layer = document.createElement("div");
    layer.className = "plate-layers";
    stage.appendChild(layer);
    const still = photo.cloneNode(false);
    still.className = "plate-image";
    photo.hidden = true;
    const lines = document.createElement("canvas");
    lines.className = "plate-tracing";
    lines.setAttribute("aria-hidden", "true");
    layer.append(still, lines);
    let index = 0, zoom = 1, drawing = false, drawn = "", pointer = null, origin = 0;
    function display() {
        const [slug, name, description] = plates[index];
        const src = "assets/capitol/" + slug + ".webp";
        if (still.getAttribute("src") !== src) {
            drawn = "";
            still.src = src;
        }
        still.alt = description;
        layer.style.setProperty("--plate-zoom", String(zoom));
        if (drawing && drawn !== src && still.complete && still.naturalWidth) {
            trace(still, lines);
            drawn = src;
        }
        layer.classList.toggle("traced", drawing && drawn === src);
        toggle.setAttribute("aria-pressed", String(drawing));
        status.textContent =
            name + " · Drag sideways to change views, or use the controls.";
    }
    function change(dir) {
        index = (index + dir + plates.length) % plates.length;
        zoom = 1;
        display();
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches &&
            layer.animate) {
            layer.animate([
                { opacity: 0.4, translate: dir * 11 + "px 0" },
                { opacity: 1, translate: "0 0" },
            ], { duration: 420, easing: "ease-out" });
        }
    }
    function operate(action) {
        if (action === "left" || action === "right") {
            change(action === "left" ? -1 : 1);
            return;
        }
        if (action === "reset") {
            index = 0;
            zoom = 1;
            drawing = false;
        }
        if (action === "in")
            zoom = Math.min(2.6, zoom * 1.22);
        if (action === "out")
            zoom = Math.max(0.8, zoom / 1.22);
        display();
    }
    still.addEventListener("load", display, { signal });
    for (const b of group.querySelectorAll("button")) {
        b.disabled = false;
        const action = b.dataset.camera;
        if (action === "left" || action === "right") {
            b.title = action === "left" ? "Previous view" : "Next view";
            b.setAttribute("aria-label", b.title);
        }
        if (action)
            b.addEventListener("click", () => operate(action), { signal });
    }
    toggle.addEventListener("click", () => {
        drawing = !drawing;
        display();
    }, { signal });
    const keys = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "in",
        ArrowDown: "out",
        Home: "reset",
    };
    stage.addEventListener("keydown", (e) => {
        if (keys[e.key]) {
            e.preventDefault();
            operate(keys[e.key]);
        }
    }, { signal });
    stage.addEventListener("pointerdown", (e) => {
        pointer = e.pointerId;
        origin = e.clientX;
        stage.setPointerCapture?.(pointer);
    }, { signal });
    stage.addEventListener("pointercancel", () => {
        pointer = null;
    }, { signal });
    stage.addEventListener("pointerup", (e) => {
        if (e.pointerId === pointer && Math.abs(e.clientX - origin) > 32)
            change(e.clientX < origin ? 1 : -1);
        pointer = null;
    }, { signal });
    display();
}
