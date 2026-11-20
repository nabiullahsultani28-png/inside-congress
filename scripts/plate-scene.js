import { ACESFilmicToneMapping, Color, DirectionalLight, GLTFLoader, HemisphereLight, OrthographicCamera, PCFSoftShadowMap, Scene, WebGLRenderer, } from "../assets/vendor/three-museum.js";
const sections = [
    { name: "North", part: "north", spread: -3.25, rise: .62 },
    { name: "Core", part: "core", spread: 0, rise: .62 },
    { name: "South", part: "south", spread: 3.25, rise: .62 },
    { name: "Base", part: "base", spread: 0, rise: -.75 },
];
const modelUrl = new URL("../assets/capitol/capitol.glb?v=2", import.meta.url);
export function disposeMeshes(object) {
    const geometries = new Set();
    const materials = new Set();
    object.traverse((node) => {
        const mesh = node;
        if (!mesh.isMesh)
            return;
        geometries.add(mesh.geometry);
        const assigned = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        assigned.forEach((material) => materials.add(material));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
}
export async function openPlateScene(root, canvas, context, signal) {
    let released = false;
    let request = 0;
    let model;
    let sizing;
    // A fixed orthographic camera also frames the four baked fallback layers.
    const scene = new Scene();
    const camera = new OrthographicCamera(-19, 19, 9.5, -9.5, .1, 100);
    camera.position.set(10, 21, 36);
    camera.lookAt(0, 4.4, 0);
    const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = .96;
    scene.add(new HemisphereLight(0xf4fbff, 0xa8b0ae, 1.75));
    const key = new DirectionalLight(0xffeed4, 3.1);
    key.position.set(-15, 22, 16);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -20, right: 20, top: 14, bottom: -14, near: 1, far: 64 });
    key.shadow.normalBias = .025;
    key.shadow.bias = -.0002;
    const edge = new DirectionalLight(0xc9e1ec, 1.7);
    edge.position.set(6, 10, -13);
    scene.add(key, edge);
    function close() {
        if (released)
            return;
        released = true;
        root.classList.remove("has-webgl");
        sizing?.disconnect();
        cancelAnimationFrame(request);
        if (model)
            disposeMeshes(model);
        key.shadow.dispose();
        renderer.dispose();
        if (!context.isContextLost())
            renderer.forceContextLoss();
    }
    function draw() {
        if (!released && model && canvas.clientWidth)
            renderer.render(scene, camera);
    }
    function resize() {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        draw();
    }
    signal.addEventListener("abort", close, { once: true });
    canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        close();
    }, { signal, once: true });
    try {
        const response = await fetch(modelUrl, { signal });
        if (!response.ok)
            throw new Error("The Capitol model could not be loaded.");
        const { scene: building } = await new GLTFLoader().parseAsync(await response.arrayBuffer(), modelUrl.href);
        if (released) {
            disposeMeshes(building);
            return;
        }
        model = building;
        scene.add(model);
        const muted = new Color("#a5b7bd");
        const groups = sections.map((section) => {
            const object = building.getObjectByName("Capitol-" + section.name);
            if (!object)
                throw new Error("The Capitol model is missing a section.");
            const copies = new Map();
            function copy(original) {
                let material = copies.get(original);
                if (!material) {
                    material = original.clone();
                    copies.set(original, material);
                }
                return material;
            }
            object.traverse((node) => {
                const mesh = node;
                if (!mesh.isMesh)
                    return;
                mesh.material = Array.isArray(mesh.material) ? mesh.material.map(copy) : copy(mesh.material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            });
            return { ...section, object, copies, offset: 0, shade: 0 };
        });
        const originals = new Set(groups.flatMap((group) => [...group.copies.keys()]));
        originals.forEach((material) => material.dispose());
        const motion = matchMedia("(prefers-reduced-motion: reduce)");
        let selection = "whole";
        let open = false;
        function show(state, instant = motion.matches) {
            open = state.separated;
            selection = state.part;
            cancelAnimationFrame(request);
            const start = performance.now();
            const from = groups.map(({ offset, shade }) => ({ offset, shade }));
            function animate(now) {
                if (released)
                    return;
                const t = instant ? 1 : Math.max(0, Math.min((now - start) / 770, 1));
                const eased = 1 - (1 - t) ** 4;
                groups.forEach((group, i) => {
                    const targetOffset = open ? 1 : 0;
                    const targetShade = selection === "whole" || selection === group.part ? 0 : .73;
                    group.offset = from[i].offset + (targetOffset - from[i].offset) * eased;
                    group.shade = from[i].shade + (targetShade - from[i].shade) * eased;
                    group.object.position.x = group.spread * group.offset;
                    group.object.position.y = group.rise * group.offset;
                    for (const [source, material] of group.copies) {
                        material.color.copy(source.color).lerp(muted, group.shade);
                    }
                });
                draw();
                if (t < 1)
                    request = requestAnimationFrame(animate);
            }
            if (instant)
                animate(start);
            else
                request = requestAnimationFrame(animate);
        }
        sizing = new ResizeObserver(resize);
        sizing.observe(canvas);
        resize();
        root.classList.add("has-webgl");
        motion.addEventListener("change", () => {
            if (motion.matches)
                show({ separated: open, part: selection }, true);
        }, { signal });
        return { show };
    }
    catch {
        close();
        return;
    }
}
