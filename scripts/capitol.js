import {installStudy} from './drawing-study.js';
import { ACESFilmicToneMapping, AmbientLight, DirectionalLight, GLTFLoader, HemisphereLight, OrbitControls, OrthographicCamera, PCFSoftShadowMap, Raycaster, Scene, Spherical, Vector2, Vector3, WebGLRenderer } from '../assets/vendor/three-museum.js';

const cameraStart = new Vector3(14.02321, 14.96939, 32.61212);
const lookAt = new Vector3(0.10877, 3.64368, 0.25294);
const modelUrl = new URL('../assets/capitol/capitol.glb', import.meta.url);

export async function showCapitol(viewer, signal) {
  const stage = viewer.querySelector('.viewer-stage');
  const status = viewer.querySelector('.viewer-status');
  const canvas = viewer.querySelector('canvas');
  const buttons = [...viewer.querySelectorAll('[data-camera]')];
  const scene = new Scene();
  const camera = new OrthographicCamera(-16, 16, 8, -8, .1, 150);
  let renderer, controls, sizing, model;
  let disposed = false;
  function disposeObject(object) {
    const geometries = new Set();
    const materials = new Set();
    object?.traverse(node => {
      if (node.geometry) geometries.add(node.geometry);
      if (node.material) for (const material of [node.material].flat()) materials.add(material);
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
  }
  function release() {
    if (disposed) return;
    disposed = true;
    sizing?.disconnect();
    controls?.dispose();
    disposeObject(model);
    for (const light of scene.children) light.shadow?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
  }
  signal.addEventListener('abort', release, {once:true});
  function showStill() {
    viewer.classList.remove('has-model');
    viewer.querySelector('.viewer-controls').hidden = true;
    status.textContent = 'Still view. Explore the House and Senate using the links below.';
    canvas.hidden = true;
    stage.removeAttribute('tabindex');
  }
  try {
    if (signal.aborted) return;
    renderer = new WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    scene.add(new HemisphereLight(0xffefdd, 0xa4b7bf, 1.55), new AmbientLight(0xffefe3, .35));
    const key = new DirectionalLight(0xffe0be, 2.95);
    key.position.set(-14, 22, 16);
    key.castShadow = true;
    key.shadow.mapSize.set(1536, 1536);
    Object.assign(key.shadow.camera, {left:-18,right:18,top:14,bottom:-14,near:.5,far:70});
    key.shadow.normalBias = .026;
    key.shadow.bias = -.0003;
    const fill = new DirectionalLight(0xc8e2ff, 1.2);
    fill.position.set(17, 9, 8);
    const rim = new DirectionalLight(0xcde7fa, 1.6);
    rim.position.set(5, 14, -13);
    scene.add(key, fill, rim);
    camera.position.copy(cameraStart);
    controls = new OrbitControls(camera, canvas);
    controls.target.copy(lookAt);
    controls.enablePan = false;
    controls.minPolarAngle = .12;
    controls.maxPolarAngle = Math.PI / 2.06;
    controls.minZoom = .68;
    controls.maxZoom = 3.25;
    controls.zoomSpeed = .8;
    controls.rotateSpeed = .72;
    controls.update();
    controls.saveState();
    function draw() { if (!disposed && model) renderer.render(scene, camera); }
    function resize() {
      const width = stage.clientWidth, height = stage.clientHeight;
      if (!width || !height || disposed) return;
      const aspect = width / height;
      const fullWidth = Math.max(30.713381, 14.56966 * aspect) * 1.025;
      camera.left = -fullWidth / 2;
      camera.right = fullWidth / 2;
      camera.top = fullWidth / aspect / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      draw();
    }
    sizing = new ResizeObserver(resize);
    sizing.observe(stage);
    resize();
    const file = await fetch(modelUrl, {signal});
    if (!file.ok) throw new Error('Could not fetch model');
    const gltf = await new GLTFLoader().parseAsync(await file.arrayBuffer(), modelUrl.href);
    if (signal.aborted) { disposeObject(gltf.scene); return; }
    model = gltf.scene;
    model.traverse(node => {
      if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; }
    });
    scene.add(model);
    installStudy(viewer,model,draw,signal);
    controls.addEventListener('change', draw);
    resize();
    viewer.classList.add('has-model');
    status.textContent = 'Drag to rotate. Select a wing to visit its chamber.';
    buttons.forEach(button => {button.disabled = false;});
    function operate(action) {
      if (action === 'reset') controls.reset();
      else if (action === 'in' || action === 'out') {
        camera.zoom = Math.min(controls.maxZoom, Math.max(controls.minZoom, camera.zoom * (action === 'in' ? 1.23 : 1 / 1.23)));
        camera.updateProjectionMatrix();
      } else {
        const offset = camera.position.clone().sub(controls.target);
        const spherical = new Spherical().setFromVector3(offset);
        spherical.theta += action === 'left' ? -.25 : .25;
        camera.position.copy(controls.target).add(new Vector3().setFromSpherical(spherical));
      }
      controls.update();
      draw();
    }
    buttons.forEach(button => button.addEventListener('click', () => operate(button.dataset.camera), {signal}));
    const keys = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'in',ArrowDown:'out',Home:'reset','+':'in','-':'out'};
    stage.addEventListener('keydown', event => {
      if (keys[event.key]) { event.preventDefault(); operate(keys[event.key]); }
    }, {signal});
    const raycaster = new Raycaster();
    const pointers = new Set();
    let down = null;
    canvas.addEventListener('pointerdown', event => {
      pointers.add(event.pointerId);
      down = pointers.size === 1 && event.button === 0 ? {id:event.pointerId, x:event.clientX, y:event.clientY} : null;
    }, {signal});
    canvas.addEventListener('pointermove', event => {
      if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) down = null;
    }, {signal});
    canvas.addEventListener('pointercancel', event => {pointers.delete(event.pointerId); down = null;}, {signal});
    canvas.addEventListener('pointerup', event => {
      pointers.delete(event.pointerId);
      const tap = down?.id === event.pointerId;
      down = null;
      if (!tap) return;
      const box = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new Vector2((event.clientX-box.left)/box.width*2-1,1-(event.clientY-box.top)/box.height*2),camera);
      const hit = raycaster.intersectObject(model,true)[0];
      if (hit && Math.abs(hit.point.x)>5 && hit.point.y>1.3) location.hash = hit.point.x<0 ? 'chambers/senate' : 'chambers/house';
    }, {signal});
    canvas.addEventListener('webglcontextlost', event => { if (!signal.aborted) {event.preventDefault(); showStill();} }, {signal});
  } catch {
    if (!signal.aborted) { showStill(); release(); }
  }
}
