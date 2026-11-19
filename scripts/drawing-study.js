import { Color, EdgesGeometry, InstancedBufferGeometry, InstancedInterleavedBuffer, InterleavedBufferAttribute, LineSegments, ShaderMaterial, } from "../assets/vendor/three-museum.js";
// Instanced feature edges keep long cornices clean and omit coplanar triangle diagonals.
export function installStudy(viewer, model, draw, signal) {
    const button = viewer.querySelector("[data-drawing]");
    button.disabled = false;
    const reveal = { value: 0 }, ink = new Color("#243746");
    const lines = [];
    const surfaces = new Map();
    let animation = 0, enabled = false;
    const shader = new ShaderMaterial({
        uniforms: { reveal },
        vertexShader: `
      attribute vec4 c0, c1, c2, c3;
      varying float across;
      void main() {
        vec4 world = modelMatrix * mat4(c0,c1,c2,c3) * vec4(position,1.0);
        across = (world.x + 14.5) / 29.0;
        gl_Position = projectionMatrix * viewMatrix * world;
        gl_Position.z -= 0.00014 * gl_Position.w;
      }`,
        fragmentShader: `
      uniform float reveal;
      varying float across;
      void main() {
        if(across > reveal) discard;
        gl_FragColor=vec4(0.95,0.79,0.59,0.86);
      }`,
        transparent: true,
        depthWrite: false,
    });
    function prepare() {
        const meshes = [];
        model.traverse((object) => {
            if (object.isMesh)
                meshes.push(object);
        });
        const identity = new Float32Array([
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
        ]);
        for (const mesh of meshes) {
            for (const mat of [mesh.material].flat()) {
                if (mat.color && !surfaces.has(mat))
                    surfaces.set(mat, mat.color.clone());
            }
            const edges = new EdgesGeometry(mesh.geometry, 32);
            const geometry = new InstancedBufferGeometry();
            geometry.setAttribute("position", edges.getAttribute("position").clone());
            edges.dispose();
            const matrices = mesh.isInstancedMesh
                ? mesh.instanceMatrix.array
                : identity;
            const blocks = new InstancedInterleavedBuffer(new Float32Array(matrices), 16);
            for (let i = 0; i < 4; i++)
                geometry.setAttribute("c" + i, new InterleavedBufferAttribute(blocks, 4, i * 4));
            geometry.instanceCount = mesh.isInstancedMesh ? mesh.count : 1;
            const line = new LineSegments(geometry, shader);
            line.frustumCulled = false;
            line.renderOrder = 1;
            line.raycast = () => { };
            mesh.add(line);
            lines.push(line);
        }
    }
    function paint(value) {
        reveal.value = value;
        surfaces.forEach((base, mat) => mat.color.copy(base).lerp(ink, value));
        lines.forEach((line) => {
            line.visible = value > 0;
        });
        draw();
    }
    button.addEventListener("click", () => {
        if (!lines.length)
            prepare();
        enabled = !enabled;
        button.setAttribute("aria-pressed", String(enabled));
        const goal = enabled ? 1 : 0, start = reveal.value;
        cancelAnimationFrame(animation);
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            paint(goal);
            return;
        }
        const began = performance.now();
        function frame(now) {
            const fraction = Math.min(1, (now - began) / 1050);
            paint(start + (goal - start) * fraction * fraction * (3 - 2 * fraction));
            if (fraction < 1)
                animation = requestAnimationFrame(frame);
        }
        animation = requestAnimationFrame(frame);
    }, { signal });
    signal.addEventListener("abort", () => {
        cancelAnimationFrame(animation);
        for (const line of lines) {
            line.removeFromParent();
            line.geometry.dispose();
        }
        shader.dispose();
    }, { once: true });
}
