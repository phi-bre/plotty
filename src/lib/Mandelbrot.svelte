<script>
  import { Mesh } from '@threlte/core';
  import { DoubleSide, PlaneGeometry, ShaderMaterial } from 'three';

  export let depth = 100;

  const geometry = new PlaneGeometry(10, 10);
  const material = new ShaderMaterial({
    side: DoubleSide,
    uniforms: {
      depth: { value: depth },
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

  $: material.uniforms.depth.value = depth;
</script>

<Mesh {geometry} {material} />
