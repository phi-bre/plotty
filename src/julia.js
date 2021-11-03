import * as neta from '@phibre/neta';
import { plotter } from './plotter';

export function julia(mouse, depth) {
  return neta
    .element({
      tag: 'canvas',
      styles: {
        display: 'block',
      },
    })
    .then((canvas) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const plot = plotter({
        canvas: canvas,
        size: 100,
        uniforms: {
          depth: depth,
          scale: { value: 1 },
          c: { value: [0, 0] },
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
          uniform vec2 c;
          varying vec3 pos;
  
          void main() {
            int iteration = 0;
            vec2 z = pos.xy;
            for (int i = 0; i < depth; i++) {
              z = -vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
              // Following looks way cooler for some reason:
              // z = vec2(2.0 * z.x * z.y, z.x * z.x - z.y * z.y) + c;
              // z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
              iteration = i;
              if (dot(z, z) > 4.0) break;
            }
            gl_FragColor = vec4(1.0 / float(depth) * float(iteration));
          }
        `,
      });

      mouse.then((vector) => {
        plot.material.uniforms.c.value = vector;
        plot.renderer.render(plot.scene, plot.camera);
      });

      depth.then((depth) => {
        plot.material.uniforms.depth.value = depth;
        plot.renderer.render(plot.scene, plot.camera);
      });

      plot.controls.addEventListener('change', () => {
        plot.material.uniforms.scale.value = plot.camera.zoom;
      });

      plot.renderer.render(plot.scene, plot.camera);

      return canvas;
    });
}
