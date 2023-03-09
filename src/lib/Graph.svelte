<script>
  import { Points, ShaderMaterial, Color, Vector4 } from 'three';
  import { MeshInstance } from '@threlte/core';
  import { IndexedBufferGeometry } from '$lib/utils.js';

  export let formula = 'sin(x)';
  export let resolution = 100;
  export let randomize = true;
  export let transparent = true;
  export let point = new Vector4(0, 0, 0, 1);
  export let color = new Color(0xffffff);

  let geometry = new IndexedBufferGeometry();
  let material = new ShaderMaterial();
  let mesh = new Points(geometry, material);

  $: {
    geometry.length = resolution ** 3;
    mesh = mesh;
  }
  $: {
    material.transparent = transparent;
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

      float rand(vec2 seed) {
        return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float f(vec3 voxel) {
        float x = voxel.x;
        float y = voxel.z;
        return (${formula});
      }

      void main() {
        float s = float(gl_VertexID) / float(resolution);
        float i = 0.0;
        float x = rand(vec2(s, i));
        vec3 position = vec3(
          x,
          0.0,
          rand(vec2(s, i + 0.1))
        );
        position = position * point.w + point.xyz - point.w / 2.0;
        position.y = f(position);
        if (position.y > point.w / 2.0 || position.y < -point.w / 2.0) {
          return;
        }

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4((position - point.xyz), 1.0);
      }
    `;
    material.fragmentShader = `
      uniform vec3 color;

      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    material.needsUpdate = true;
    mesh = mesh;
  }
</script>

<MeshInstance frustumCulled={false} {mesh} />
