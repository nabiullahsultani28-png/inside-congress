import {
  ACESFilmicToneMapping,
  DirectionalLight,
  GLTFLoader,
  HemisphereLight,
  OrthographicCamera,
  PCFSoftShadowMap,
  Scene,
  Vector3,
  WebGLRenderer,
} from "../assets/vendor/three-museum.js";
import type { Material, Mesh, Object3D } from "three";
import { shots, type Lens } from "./camera-tour.js";

function releaseMeshes(object: Object3D) {
  const geometry = new Set<Mesh["geometry"]>(),
    materials = new Set<Material>();
  object.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    geometry.add(mesh.geometry);
    for (const material of [mesh.material].flat()) materials.add(material);
  });
  geometry.forEach((item) => item.dispose());
  materials.forEach((item) => item.dispose());
}

export async function createLens(
  frame: HTMLElement,
  signal: AbortSignal,
): Promise<Lens | undefined> {
  if (signal.aborted) return;
  const canvas = frame.querySelector("canvas")!;
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  const scene = new Scene(),
    camera = new OrthographicCamera(-16, 16, 9, -9, 0.1, 140);
  let model: Object3D | undefined,
    observer: ResizeObserver | undefined,
    closed = false;
  let width = 0,
    height = 0,
    span = shots[0].width,
    shotIndex = 0,
    shotTime = 0;
  const target = new Vector3(...shots[0].target),
    to = new Vector3(),
    aim = new Vector3();
  camera.position.set(...shots[0].position);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const sun = new DirectionalLight(0xffc29a, 3.2);
  sun.position.set(-13, 18, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  Object.assign(sun.shadow.camera, {
    left: -18,
    right: 18,
    top: 15,
    bottom: -15,
    near: 0.1,
    far: 65,
  });
  sun.shadow.normalBias = 0.023;
  sun.shadow.bias = -0.00025;
  const edge = new DirectionalLight(0xffdfb1, 1.7);
  edge.position.set(10, 14, -17);
  const fill = new DirectionalLight(0xbfcede, 0.7);
  fill.position.set(18, 5, 12);
  scene.add(sun, edge, fill, new HemisphereLight(0xf6e7de, 0x7f6274, 1.25));
  function close() {
    if (closed) return;
    closed = true;
    observer?.disconnect();
    if (model) releaseMeshes(model);
    sun.shadow.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  function draw(
    index: number,
    seconds: number,
    elapsed: number,
    moving: boolean,
  ) {
    if (closed || !model || !width || !height) return;
    shotIndex = index;
    shotTime = seconds;
    const shot = shots[index],
      drift = moving ? Math.sin(seconds * 0.35) * 0.31 : 0;
    aim.set(...shot.target);
    to.set(...shot.position).sub(aim);
    const bearing = Math.atan2(to.x, to.z) + drift,
      radius = Math.hypot(to.x, to.z);
    to.x = radius * Math.sin(bearing);
    to.z = radius * Math.cos(bearing);
    to.add(aim);
    const mix = moving ? 1 - Math.exp(-elapsed * 3.4) : 1;
    target.lerp(aim, mix);
    camera.position.lerp(to, mix);
    span +=
      (shot.width * (1 - (moving ? 0.028 * Math.sin(seconds * 0.35) : 0)) -
        span) *
      mix;
    const aspect = width / height;
    camera.left = -span / 2;
    camera.right = span / 2;
    camera.top = span / (2 * aspect);
    camera.bottom = -camera.top;
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  function size() {
    width = frame.clientWidth;
    height = frame.clientHeight;
    if (width && height) {
      renderer.setSize(width, height, false);
      draw(shotIndex, shotTime, 0, true);
    }
  }
  signal.addEventListener("abort", close, { once: true });
  try {
    const url = new URL("../assets/capitol/capitol.glb", import.meta.url);
    const response = await fetch(url, { signal });
    if (!response.ok) throw Error("Model unavailable");
    const gltf = await new GLTFLoader().parseAsync(
      await response.arrayBuffer(),
      url.href,
    );
    if (closed) {
      releaseMeshes(gltf.scene);
      return;
    }
    model = gltf.scene;
    model.traverse((node) => {
      if ((node as Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(model);
    observer = new ResizeObserver(size);
    observer.observe(frame);
    size();
    return { draw, close };
  } catch {
    close();
    return;
  }
}
