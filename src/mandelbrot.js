import * as neta from '@phibre/neta';
import * as THREE from 'three';
import { plotter } from './plotter';

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
      const plot = plotter({
        canvas: canvas,
        size: size,
        uniforms: {
          depth: { value: 100 },
          scale: { value: 1 },
        },
        vertex: `
          varying vec3 pos;
        
          void main() {
            pos = position;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
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

      const grid = new THREE.GridHelper(size, 2);
      grid.rotateX(Math.PI / 2);
      plot.scene.add(grid);

      const geometry = new THREE.TorusGeometry(0.05, 0.01, 16, 100);
      const material = new THREE.MeshBasicMaterial({ color: 0x5dadff });
      const torus = new THREE.Mesh(geometry, material);
      plot.scene.add(torus);

      mouse.then((vector) => {
        torus.position.set(vector.x, vector.y, 0);
        plot.renderer.render(plot.scene, plot.camera);
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
          ).unproject(plot.camera);
          mouse.set(new THREE.Vector2(position.x, position.y));
        });
      });

      plot.controls.addEventListener('change', (event) => {
        plot.material.uniforms.scale.value = plot.camera.zoom;
        torus.scale.setLength(1 / plot.camera.zoom);
        plot.renderer.render(plot.scene, plot.camera);
      });

      plot.renderer.render(plot.scene, plot.camera);

      return canvas;
    });
}
