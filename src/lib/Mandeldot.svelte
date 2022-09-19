<script>
  import {
    Points,
    ShaderMaterial,
    Color,
    Vector4,
    Scene,
    WebGLRenderTarget,
    OrthographicCamera,
  } from 'three';
  import { MeshInstance } from '@threlte/core';
  import { IndexedBufferGeometry } from '$lib/utils.js';

  export let depth = 1000;
  export let resolution = 100;
  export let point = new Vector4(0, 0, 0, 1);
  export let imaginary = true;
  export let randomize = true;

  // const threlte = useThrelte();
  // const scene = new Scene();
  // const texture = new WebGLRenderTarget(1, resolution ** 3);
  // // texture.texture.minFilter = THREE.LinearFilter;
  // const camera = new OrthographicCamera(0, resolution ** 3, 0, 1);
  // threlte.renderer.render(scene, camera, texture, true);

  let previousResolution = 0;
  let geometry = new IndexedBufferGeometry();
  let material = new ShaderMaterial({
    transparent: true,
    uniforms: {
      imaginary: { value: imaginary },
      randomize: { value: randomize },
      depth: { value: depth },
      point: { value: point },
      resolution: { value: resolution },
      color: { value: new Color(0xffffff) },
      // texture: { value: texture.texture },
    },
    vertexShader: `
      uniform vec4 point;
      uniform bool imaginary;
      uniform bool randomize;
      uniform int resolution;
      uniform int depth;
      uniform sampler2D texture;

      varying float intensity;

      float rand(vec2 seed) {
        return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
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

        int iteration;
        vec2 z;
        vec2 zz;

        for (int i = 0; i < depth; i++) {
          z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + voxel.xy;
          iteration = i;
          if (dot(z, z) > 4.0) break;

          float distance = abs(voxel.z - (imaginary ? z.x : z.y));
          if (distance <= error && iteration > 0) {
            zz = z;
            intensity++;
          }
        }

        voxel.z = imaginary ? zz.x : zz.y;
        intensity /= float(depth);

        if (intensity < 0.01) return;

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4((voxel - point.xyz) / point.w, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform int depth;

      varying float intensity;

      void main() {
        gl_FragColor = vec4(color, intensity);
      }
    `,
  });
  let mesh = new Points(geometry, material);

  $: if (previousResolution !== resolution) {
    geometry.length = resolution ** 3;
    previousResolution = resolution;
  }

  $: {
    material.uniforms.resolution.value = resolution;
    material.uniforms.depth.value = depth;
    material.uniforms.randomize.value = randomize;
    material.uniforms.imaginary.value = imaginary;
    material.uniforms.point.value = point;
  }
</script>

<MeshInstance frustumCulled={false} {mesh} scale={0.5} />
