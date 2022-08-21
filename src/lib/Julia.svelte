<script>
  import { Mesh } from '@threlte/core';
  import { PlaneGeometry, ShaderMaterial } from 'three';

  export let depth = 100;
  export let point;

  const geometry = new PlaneGeometry(10, 10);
  const material = new ShaderMaterial({
    uniforms: {
      depth: { value: depth },
      point: { value: point },
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
      uniform vec2 point;
      varying vec3 pos;

      void main() {
        int iteration = 0;
        vec2 z = pos.xy;
        for (int i = 0; i < depth; i++) {
          z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + point;
          iteration = i;
          if (dot(z, z) > 4.0) break;
        }
        gl_FragColor = vec4(1.0 / float(depth) * float(iteration));
      }
    `,
  });

  $: material.uniforms.depth.value = depth;
  $: material.uniforms.point.value = point;
</script>

<Mesh {geometry} {material} />
