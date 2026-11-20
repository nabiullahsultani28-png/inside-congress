import type {Mesh, Object3D} from "three";
import {showPlates} from "./plate-viewer.js";
import {installStudy} from "./drawing-study.js";
import {disposeMeshes} from "./plate-scene.js";
import {
  ACESFilmicToneMapping, DirectionalLight, GLTFLoader, HemisphereLight, OrbitControls,
  OrthographicCamera, PCFSoftShadowMap, Raycaster, Scene, Spherical, Vector2, Vector3, WebGLRenderer,
} from "../assets/vendor/three-museum.js";

const modelUrl = new URL("../assets/capitol/capitol.glb?v=2", import.meta.url);
const keys: Record<string, string> = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "in", ArrowDown: "out", Home: "reset", "+": "in", "-": "out",
};

export async function showCapitol(viewer: HTMLElement, context: WebGL2RenderingContext, signal: AbortSignal) {
  const stage = viewer.querySelector<HTMLElement>(".viewer-stage")!;
  const status = viewer.querySelector<HTMLElement>(".viewer-status")!;
  const canvas = viewer.querySelector<HTMLCanvasElement>("canvas")!;
  const buttons = [...viewer.querySelectorAll<HTMLButtonElement>("[data-camera]")];
  const scene = new Scene();
  const camera = new OrthographicCamera(-16, 16, 8, -8, .1, 150);
  const renderer = new WebGLRenderer({canvas, context, alpha: true, antialias: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  scene.add(new HemisphereLight(0xfff1e0, 0xa6b8bc, 1.85));
  const key = new DirectionalLight(0xffebd5, 3.1);
  key.position.set(-14, 22, 16);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {left: -18, right: 18, top: 14, bottom: -14, near: .5, far: 70});
  key.shadow.normalBias = .026;
  key.shadow.bias = -.0003;
  const rim = new DirectionalLight(0xcde7fa, 1.6);
  rim.position.set(5, 14, -13);
  scene.add(key, rim);
  camera.position.set(14.023, 14.969, 32.612);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(.109, 3.644, .253);
  controls.enablePan = false;
  controls.minPolarAngle = .12;
  controls.maxPolarAngle = Math.PI / 2.06;
  controls.minZoom = .68;
  controls.maxZoom = 3.25;
  controls.zoomSpeed = .8;
  controls.rotateSpeed = .72;
  controls.update();
  controls.saveState();

  let model: Object3D | undefined;
  let disposed = false;
  const listeners = new AbortController();

  function draw() {
    if (!disposed && model) renderer.render(scene, camera);
  }
  function resize() {
    const {clientWidth: width, clientHeight: height} = stage;
    if (!width || !height || disposed) return;
    const aspect = width / height;
    const fullWidth = Math.max(30.714, 14.57 * aspect) * 1.025;
    camera.left = -fullWidth / 2;
    camera.right = fullWidth / 2;
    camera.top = fullWidth / aspect / 2;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  }
  const sizing = new ResizeObserver(resize);
  sizing.observe(stage);
  function close() {
    if (disposed) return;
    disposed = true;
    listeners.abort();
    sizing.disconnect();
    controls.dispose();
    if (model) disposeMeshes(model);
    key.shadow.dispose();
    renderer.dispose();
    if (!context.isContextLost()) renderer.forceContextLoss();
  }
  function usePlates() {
    close();
    if (!signal.aborted) showPlates(viewer, signal);
  }
  signal.addEventListener("abort", close, {once: true});
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    usePlates();
  }, {signal: listeners.signal, once: true});

  try {
    const response = await fetch(modelUrl, {signal});
    if (!response.ok) throw new Error("The Capitol model could not be loaded.");
    const {scene: building} = await new GLTFLoader().parseAsync(await response.arrayBuffer(), modelUrl.href);
    if (disposed) { disposeMeshes(building); return; }
    model = building;
    building.traverse((node) => {
      const mesh = node as Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
    scene.add(building);
    installStudy(viewer, building, draw, listeners.signal);
    controls.addEventListener("change", draw);
    resize();
    viewer.classList.add("has-model");
    status.textContent = "Drag to rotate. Select a wing to visit its chamber.";
    buttons.forEach((button) => { button.disabled = false; });

    function operate(action: string) {
      if (action === "reset") controls.reset();
      else if (action === "in" || action === "out") {
        camera.zoom = Math.min(controls.maxZoom, Math.max(controls.minZoom, camera.zoom * (action === "in" ? 1.23 : 1 / 1.23)));
        camera.updateProjectionMatrix();
      } else {
        const offset = camera.position.clone().sub(controls.target);
        const spherical = new Spherical().setFromVector3(offset);
        spherical.theta += action === "left" ? -.25 : .25;
        camera.position.copy(controls.target).add(new Vector3().setFromSpherical(spherical));
      }
      controls.update();
      draw();
    }
    const events = {signal: listeners.signal};
    for (const button of buttons) button.addEventListener("click", () => operate(button.dataset.camera!), events);
    stage.addEventListener("keydown", (event) => {
      if (keys[event.key]) { event.preventDefault(); operate(keys[event.key]); }
    }, events);
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let tap: {id: number; x: number; y: number} | undefined;
    canvas.addEventListener("pointerdown", (event) => {
      tap = event.isPrimary && event.button === 0 ? {id: event.pointerId, x: event.clientX, y: event.clientY} : undefined;
    }, events);
    canvas.addEventListener("pointermove", (event) => {
      if (tap && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 5) tap = undefined;
    }, events);
    canvas.addEventListener("pointercancel", () => { tap = undefined; }, events);
    canvas.addEventListener("pointerup", (event) => {
      if (tap?.id !== event.pointerId) return;
      tap = undefined;
      const box = canvas.getBoundingClientRect();
      pointer.set((event.clientX - box.left) / box.width * 2 - 1, 1 - (event.clientY - box.top) / box.height * 2);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(building, true)[0];
      for (let node: Object3D | undefined = hit?.object; node; node = node.parent ?? undefined) {
        if (node.name === "Capitol-North") { location.hash = "chambers/senate"; break; }
        if (node.name === "Capitol-South") { location.hash = "chambers/house"; break; }
      }
    }, events);
  } catch {
    usePlates();
  }
}
