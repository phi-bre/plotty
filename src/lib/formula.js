import { writable } from 'svelte/store';
import * as math from 'mathjs';
import katex from 'katex';
import * as THREE from './three';

export default function (canvas) {
  const store = writable({
    formula: '', // abs(sin(x^x)/2^((x^x-pi/2)/pi)),
    parsed: null,
    compiled: null,
    latex: '',
    scope: {},
  });

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

  const material = new THREE.ShaderMaterial({
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.365, 0.678, 1, 0);
      }
    `,
  });

  // const material = new THREE.LineBasicMaterial({ color: 0x5dadff, linewidth: 2 });
  const geometry = new THREE.BufferGeometry();
  const POINT_COUNT = 100000;
  const points = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    points.push(new THREE.Vector3(i - POINT_COUNT / 2, 0));
  }
  geometry.setFromPoints(points);

  const mesh = new THREE.Line(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  controls.addEventListener('change', () => store.update((e) => e));
  window.addEventListener('resize', resize);
  resize();
  setFormula('tan(x)');

  function resize() {
    const size = canvas.getBoundingClientRect();
    canvas.width = size.width;
    canvas.height = size.height;
    camera.left = size.width / -1;
    camera.right = size.width / +1;
    camera.top = size.height / -1;
    camera.bottom = size.height / +1;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(size.width, size.height);
    store.update((s) => s);
  }

  store.subscribe((state) => {
    if (!state.compiled) return;
    // const lx = camera.position.x - -camera.left / camera.zoom;
    // const rx = camera.position.x + +camera.right / camera.zoom;
    // points.forEach((point, index) => {
    //   point.x = lx + (rx - lx) * index / points.length;
    // });
    // geometry.setFromPoints(points);
    material.uniforms.zoom = { value: camera.zoom };
    renderer.render(scene, camera);

    // try {
    //   const lx = camera.position.x - -camera.left / camera.zoom;
    //   const rx = camera.position.x + +camera.right / camera.zoom;
    //   const step = 1 / camera.zoom;
    //   const points = [];
    //
    //   for (let x = lx; x <= rx; x += step) {
    //     const y = -state.compiled.evaluate({ ...state.scope, x });
    //     points.push(new THREE.Vector3(x, y));
    //   }
    //
    //   geometry.setFromPoints(points);
    //   renderer.render(scene, camera);
    // } catch (e) {
    //   console.error(e);
    // }
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
      const variables = parsed
        .filter((node) => node.isSymbolNode && node.name.length === 1 && node.name !== 'x')
        .map((node) => [node.name, 0])
        .sort();
      const scope = Object.fromEntries(variables);
      const glsl = parsed.toString({
        handler(node, options) {
          if (node.type === 'ConstantNode') {
            return `float(${node.value})`;
          } else if (node.type === 'OperatorNode') {
            if (node.op === '^') {
              return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
            } else {
              return `${node.args[0].toString(options)} ${node.op} ${node.args[1].toString(options)}`;
            }
          }
          return node.toString();
        },
      });
      material.vertexShader = `
        uniform float zoom;
        ${variables.map(([name]) => `uniform float ${name};`).join('\n')}
        void main() {
          float x = position.x * (1.0 / zoom) + cameraPosition.x;
          float y = (${glsl});
          gl_Position = projectionMatrix * modelViewMatrix * vec4(x, -y, 0, 1.0);
        }
      `;
      mesh.material = material;
      mesh.material.needsUpdate = true;

      store.update((state) => {
        Object.keys(scope).forEach((key) => {
          state.scope[key] ??= scope[key];
          material.uniforms[key] = {
            type: 'float',
            value: state.scope[key],
          };
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
    store.update((state) => {
      state.scope[name] = math.round(value, 2);
      material.uniforms[name] = state.scope[name];
      mesh.material.needsUpdate = true;
      return state;
    });
  }

  function destroy() {}

  return { store, setFormula, setScope, destroy };
}
