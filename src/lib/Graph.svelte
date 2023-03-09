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
        float error = 2.0 / float(resolution);

        vec3 position = vec3(
          gl_VertexID % resolution,
          gl_VertexID / resolution % resolution,
          gl_VertexID / resolution / resolution % resolution
        ) * error - 1.0;

        vec3 voxel = position * point.w + point.xyz;
        if (randomize) voxel += (error * 2.0) * (rand(voxel.xy) - 1.0);
        voxel.y = f(voxel);

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4((voxel - point.xyz) / point.w, 1.0);
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
