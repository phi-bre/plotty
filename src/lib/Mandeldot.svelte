<script>
  import {
    BufferAttribute,
    BufferGeometry,
    Points,
    ShaderMaterial,
    Color,
    Vector4, Vector2,
  } from 'three';
  import { MeshInstance } from '@threlte/core';
  import { Disposables } from '@threlte/extras';

  export let depth = 1000;
  export let resolution = 100;
  export let point = new Vector4(0, 0, 0, 1);
  export let julia;
  export let imaginary = true;

  let previousResolution;
  let previousPoint;

  function map(value, from, to, min, max) {
    return ((value - from) * (max - min)) / (to - from) + min;
  }

  $: count = resolution ** 3;

  let geometry = new BufferGeometry();
  let material = new ShaderMaterial({
    transparent: true,
    uniforms: {
      imaginary: { value: imaginary },
      depth: { value: depth },
      point: { value: point },
      julia: { value: julia },
      mandel: { value: !julia },
      resolution: { value: resolution },
      count: { value: count },
      color: { value: new Color(0xffffff) },
    },
    vertexShader: `
      uniform vec4 point;
      uniform vec2 julia;
      uniform bool imaginary;
      uniform bool mandel;
      uniform int resolution;
      uniform int depth;
      varying float v;

      float rand(vec2 seed) {
        return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        v = 0.0;

        float error = 2.0 / float(resolution);

        vec3 voxel = position * point.w + point.xyz;
        voxel += (error) * (rand(voxel.xy) - 1.0);

        int iteration;
        vec2 z;
        vec2 zz;

        if (!mandel) {
          z = voxel.xy;
        }

        for (int i = 0; i < depth; i++) {
          z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);

          if (mandel) {
            z += voxel.xy;
          } else {
            z += julia;
          }

          iteration = i;
          if (dot(z, z) > 4.0) break;

          float d = abs(voxel.z - (imaginary ? z.x : z.y));
          if (d <= error && iteration > 1) {
            zz = z;
            v++;
          }
        }

        if (imaginary) {
          voxel.z = zz.x;
        } else {
          voxel.z = zz.y;
        }

        v /= float(depth) / 10.0;

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4((voxel - point.xyz) / point.w, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float v;

      void main() {
        gl_FragColor = vec4(color, v);
      }
    `,
  });
  let mesh = new Points(geometry, material);

  $: if (previousResolution !== resolution) {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = map(i % resolution, 0, resolution, -1, 1);
      positions[i * 3 + 1] = map(Math.floor(i / resolution) % resolution, 0, resolution, -1, 1);
      positions[i * 3 + 2] = map(Math.floor(i / resolution / resolution), 0, resolution, -1, 1);
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    mesh = mesh;
    previousResolution = count;
  }

  $: {
    material.uniforms.depth.value = depth;
    material.uniforms.julia.value = julia ?? new Vector2();
    material.uniforms.imaginary.value = imaginary;
    material.uniforms.mandel.value = !julia;
    material.needsUpdate = true;
    mesh = mesh;
  }

  $: if (
    previousPoint?.x !== point.x ||
    previousPoint?.y !== point.y ||
    previousPoint?.z !== point.z ||
    previousPoint?.w !== point.w
  ) {
    material.uniforms.point.value = point;
    material.needsUpdate = true;
    mesh = mesh;

    previousPoint = point.clone();
  }
</script>

<Disposables disposables={[mesh]}>
  <MeshInstance frustumCulled={false} {mesh} scale={0.5}/>
</Disposables>
