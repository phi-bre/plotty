<script>
  import { Points, ShaderMaterial, Color, Vector4 } from 'three';
  import { MeshInstance } from '@threlte/core';
  import { IndexedBufferGeometry } from '$lib/utils.js';

  export let formula = 'sin(x)';
  export let resolution = 100;
  export let randomize = true;
  export let point = new Vector4(0, 0, 0, 1);
  export let color = new Color(0xffffff);

  let geometry = new IndexedBufferGeometry();
  let material = new ShaderMaterial({ transparent: true });
  let mesh = new Points(geometry, material);

  $: {
    geometry.length = resolution * resolution;
    mesh = mesh;
  }
  $: {
    material.uniforms.resolution = { value: resolution };
    material.uniforms.randomize = { value: randomize };
    material.uniforms.point = { value: point };
    material.uniforms.color = { value: color };
    mesh = mesh;
  }
  $: {
    material.vertexShader = `
      uniform vec4 point;
      uniform bool randomize;
      uniform int resolution;

      varying vec3 pos;

      float rand(vec2 seed) {
        return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float f(vec3 voxel) {
        float x = voxel.x;
        float y = voxel.z;
        return (${formula});
      }

      void main() {
        float i = float(gl_VertexID);
        float l = float(resolution);
        vec3 position = vec3(i / l, 0.0, mod(i, l)) / float(resolution);
        if (randomize) {
          position += rand(position.xy) * (1.0 / float(resolution));
        }
        position = position * point.w + point.xyz - point.w / 2.0;
        position.y = f(position);

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        pos = position;
      }
    `;
    material.fragmentShader = `
      uniform vec4 point;
      uniform vec3 color;
      uniform int resolution;

      varying vec3 pos;

      // https://www.shadertoy.com/view/Wt2yDG
      // -abs(sin(x) * cos(y) * exp(abs(1.0 - (sqrt(x*x + y*y)/3.14159265))))
      void main() {
        // float y = pos.y - point.y;
        // float b = clamp(y, 0.0, 1.0);
        gl_FragColor = vec4(color, 250.0 / float(resolution));
      }
    `;
    material.needsUpdate = true;
    mesh = mesh;
  }
</script>

<MeshInstance frustumCulled={false} {mesh} />
