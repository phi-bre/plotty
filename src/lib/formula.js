import { writable } from "svelte/store";
import * as math from "mathjs";
import katex from "katex";
import * as THREE from "./three";

export default function (canvas) {
  const store = writable({
    formula: '', // abs(sin(x^x)/2^((x^x-pi/2)/pi)),
    parsed: null,
    compiled: null,
    latex: '',
    scope: {},
  });

  setFormula('sin(x) + a');

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const camera = new THREE.OrthographicCamera(
    canvas.width / -1,
    canvas.width / +1,
    canvas.height / -1,
    canvas.height / +1,
    Number.MIN_VALUE,
    Number.MAX_VALUE,
  );
  camera.lookAt(0, 0, 0);

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableRotate = false;
  controls.screenSpacePanning = true;

  const scene = new THREE.Scene();

  const grid = new THREE.GridHelper(1000, 2 * 4, 0x333333, 0x151515);
  grid.rotateX(Math.PI / 2);
  scene.add(grid);

  const material = new THREE.LineBasicMaterial({ color: 0x5dadff, linewidth: 2 });
  const geometry = new THREE.BufferGeometry();
  const mesh = new THREE.Line(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  controls.addEventListener('change', () => store.update(e => e));
  window.addEventListener('resize', resize);
  resize();

  function resize() {
    const parent = canvas.parentElement.getBoundingClientRect();
    canvas.width = parent.width;
    canvas.height = parent.height;
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);
    store.update(s => s);
  }

  store.subscribe((state) => {
    if (!state.compiled) return;

    try {
      const lx = camera.position.x - -camera.left / camera.zoom;
      const rx = camera.position.x + +camera.right / camera.zoom;
      const step = 1 / camera.zoom;
      const points = [];

      for (let x = lx; x <= rx; x += step) {
        const y = -state.compiled.evaluate({ ...state.scope, x });
        points.push(new THREE.Vector3(x, y));
      }

      geometry.setFromPoints(points);
      renderer.render(scene, camera);
    } catch (e) {
      console.error(e);
    }
  });

  function setFormula(formula) {
    try {
      const parsed = math.parse(formula);
      const compiled = parsed.compile();
      const latex = katex.renderToString(parsed.toTex(), {
        throwOnError: false,
        displayMode: true,
        output: 'html',
      });
      const variables = parsed.filter((node) => node.isSymbolNode && node.name.length === 1 && node.name !== 'x')
        .map((node) => [node.name, 0])
        .sort();
      const scope = Object.fromEntries(variables);

      store.update(state => {
        Object.keys(scope).forEach((key) => {
          state.scope[key] ??= scope[key];
        });

        state.formula = formula;
        state.parsed = parsed;
        state.compiled = compiled;
        state.latex = latex;

        return state;
      });

    } catch (e) {
      console.error(e);
    }
  }

  function setScope(name, value) {
    store.update(state => {
      state.scope[name] = value;
      return state;
    });
  }

  function destroy() {

  }

  return { store, setFormula, setScope, destroy };
}
