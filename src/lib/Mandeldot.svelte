<script>
  import {
    BufferAttribute,
    BufferGeometry,
    Points,
    ShaderMaterial,
    Color,
    Vector4,
  } from 'three';
  import { MeshInstance } from '@threlte/core';
  import { Disposables } from '@threlte/extras';

  export let depth = 1000;
  export let resolution = 100;
  export let point = new Vector4(0, 0, 0, 1);
  export let imaginary = true;

  let indexes = new Uint32Array(0);
  let geometry = new BufferGeometry();
  let material = new ShaderMaterial({
    transparent: true,
    uniforms: {
      imaginary: { value: imaginary },
      depth: { value: depth },
      point: { value: point },
      resolution: { value: resolution },
      color: { value: new Color(0xffffff) },
    },
    vertexShader: `
      uniform vec4 point;
      uniform bool imaginary;
      uniform int resolution;
      uniform int depth;

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
        voxel += (error) * (rand(voxel.xy) - 1.0);

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

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4((voxel - point.xyz) / point.w, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform int depth;

      varying float intensity;

      void main() {
        gl_FragColor = vec4(color, intensity / float(depth));
      }
    `,
  });
  let mesh = new Points(geometry, material);

  $: if (indexes.length !== resolution) {
    const count = resolution ** 3;

    if (indexes.length < count) {
      const temp = new Uint32Array(count);
      temp.set(indexes);
      geometry.setAttribute('position', new BufferAttribute(temp, 1));
      indexes = temp;
      geometry.setDrawRange(0, count);
    } else if (indexes.length > count) {
      geometry.setDrawRange(0, count);
    }

    mesh = mesh;
  }

  $: {
    material.uniforms.resolution.value = resolution;
    material.uniforms.depth.value = depth;
    material.uniforms.imaginary.value = imaginary;
    material.uniforms.point.value = point;
    material.needsUpdate = true;
    mesh = mesh;
  }
</script>

<Disposables disposables={[mesh]}>
  <MeshInstance frustumCulled={false} {mesh} scale={0.5}/>
</Disposables>
