const parts = {
    whole: "Both chambers meet on the second floor, on opposite sides of the Rotunda.",
    north: "The Senate meets in the north wing. Every state sends two senators.",
    core: "The Rotunda is the circular room beneath the dome. It connects the two wings and hosts ceremonies.",
    south: "The House meets in the south wing. Each district elects one voting representative.",
};
export function wireCapitolPlate(root, signal) {
    const buttons = [...root.querySelectorAll("[data-part-select]")];
    const separate = root.querySelector("[data-separate]");
    const note = root.querySelector(".part-notes");
    const state = { separated: false, part: "whole" };
    let scene;
    function update() {
        root.dataset.separated = String(state.separated);
        root.dataset.part = state.part;
        note.textContent = parts[state.part];
        separate.textContent = state.separated ? "Reassemble the Capitol" : "Separate the wings";
        separate.setAttribute("aria-pressed", String(state.separated));
        for (const button of buttons) {
            button.setAttribute("aria-pressed", String(button.dataset.partSelect === state.part));
        }
        scene?.show(state);
    }
    root.dataset.interactive = "";
    separate.disabled = false;
    buttons.forEach((button) => { button.disabled = false; });
    update();
    separate.addEventListener("click", () => {
        state.separated = !state.separated;
        state.part = "whole";
        update();
    }, { signal });
    for (const button of buttons) {
        button.addEventListener("click", () => {
            const selected = button.dataset.partSelect;
            state.part = selected === state.part ? "whole" : selected;
            state.separated = true;
            update();
        }, { signal });
    }
    // The architectural plates render immediately. Load the 3D scene when the reader reaches them.
    async function load() {
        if (signal.aborted)
            return;
        const previous = root.querySelector(".maquette-canvas");
        const canvas = previous.cloneNode(false);
        previous.replaceWith(canvas);
        const context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" });
        if (!context)
            return;
        try {
            const { openPlateScene } = await import("./plate-scene.js");
            if (signal.aborted)
                return;
            scene = await openPlateScene(root, canvas, context, signal);
            if (signal.aborted)
                return;
            scene?.show(state, true);
        }
        catch {
            root.classList.remove("has-webgl");
        }
    }
    const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting)
            return;
        observer.disconnect();
        void load();
    }, { rootMargin: "64px" });
    observer.observe(root.querySelector(".maquette"));
    signal.addEventListener("abort", () => observer.disconnect(), { once: true });
}
