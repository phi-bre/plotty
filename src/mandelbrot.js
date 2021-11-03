import * as neta from '@phibre/neta';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function mandelbrot(mouse) {
  return neta
    .element({
      tag: 'canvas',
      styles: {
        display: 'block',
        border: '0.5px solid #5dadff',
      },
      attributes: {
        width: 300,
        height: 300,
      },
    })
    .then((canvas) => {
      const size = 300;
      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
      const camera = new THREE.OrthographicCamera(
        canvas.width / -size,
        canvas.width / +size,
        canvas.height / -size,
        canvas.height / +size,
        Number.MIN_VALUE,
        Number.MAX_VALUE
      );
      camera.lookAt(0, 0, 0);
      const controls = new OrbitControls(camera, canvas);
      controls.enableRotate = false;
      controls.screenSpacePanning = true;

      const scene = new THREE.Scene();

      const mandelbrotMaterial = new THREE.ShaderMaterial({
        uniforms: {
          depth: { value: 100 },
          scale: { value: 1 },
        },
        vertexShader: `
          varying vec3 pos;
        
          void main() {
            pos = position;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform int depth;
          uniform float scale;
          varying vec3 pos;
  
          void main() {
            int iteration = 0;
            vec2 z = vec2(0.0);
            for (int i = 0; i < depth; i++) {
              z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + pos.xy;
              iteration = i;
              if (dot(z, z) > 4.0) break;
            }
            gl_FragColor = vec4(1.0 / float(depth) * float(iteration));
          }
        `,
      });
      const mandelbrotGeometry = new THREE.PlaneGeometry(size, size);
      const mandelbrotMesh = new THREE.Mesh(
        mandelbrotGeometry,
        mandelbrotMaterial
      );
      mandelbrotMesh.rotateY(Math.PI);
      scene.add(mandelbrotMesh);

      const grid = new THREE.GridHelper(size, 2);
      grid.rotateX(Math.PI / 2);
      scene.add(grid);

      const geometry = new THREE.TorusGeometry(0.05, 0.01, 16, 100);
      const material = new THREE.MeshBasicMaterial({ color: 0x5dadff });
      const torus = new THREE.Mesh(geometry, material);
      scene.add(torus);
      mouse.then((vector) => {
        torus.position.set(vector.x, vector.y, 0);
        renderer.render(scene, camera);
      });

      let change = false;
      canvas.addEventListener('pointerdown', () => (change = true));
      canvas.addEventListener('pointerup', () => (change = false));

      ['pointermove', 'wheel'].forEach((type) => {
        canvas.addEventListener(type, (event) => {
          if (!change) return;
          const position = new THREE.Vector3(
            ((event.offsetX - canvas.width / 2) / size) * 2,
            ((event.offsetY - canvas.height / 2) / size) * -2,
            0
          ).unproject(camera);
          mouse.set(new THREE.Vector2(position.x, position.y));
        });
      });

      controls.addEventListener('change', (event) => {
        mandelbrotMaterial.uniforms.scale.value = camera.zoom;
        torus.scale.setLength(1 / camera.zoom);
        renderer.render(scene, camera);
      });

      renderer.render(scene, camera);

      return canvas;
    });
}
