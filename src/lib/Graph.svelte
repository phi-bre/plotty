<script>
  import { Vector4, PlaneGeometry, DoubleSide, MeshNormalMaterial } from 'three';
  import { T } from '@threlte/core';

  export let glsl = '0.0';
  export let symbols = [];
  export let values = {};
  export let resolution = 100;
  export let randomize = false;
  export let wireframe = false;
  export let point = new Vector4(0, 0, 0, 1);

  $: geometry = new PlaneGeometry(1, 1, resolution, resolution);
  const material = new MeshNormalMaterial({
    depthWrite: false,
    side: DoubleSide,
    wireframe: false,
    transparent: true,
    opacity: 0.8,
  });

  function onBeforeCompile(shader) {
    symbols.forEach((symbol) => (shader.uniforms[symbol] = { value: values[symbol] || 0 }));
    shader.uniforms.point = { value: point };
    shader.uniforms.fidelity = { value: resolution };
    shader.uniforms.randomize = { value: randomize };
    shader.uniforms.point = { value: point };
    shader.vertexShader = `
        uniform vec4 point;
        uniform bool randomize;
        uniform int fidelity;
        ${symbols.map((symbol) => `uniform float ${symbol};`).join('')}

        float f(vec3 voxel) {
          float x = voxel.x;
          float y = voxel.z;
          return (${glsl});
        }

        ${shader.vertexShader}
      `;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        vec3 transformed = position.xzy;
        transformed = transformed * point.w + point.xyz;// - point.w / 2.0;
        transformed.y = f(transformed);
        float delta = point.w / 1000.0;
        float dxy = (f(transformed + vec3(delta, 0.0, 0.0)) - transformed.y) / delta;
        float dxz = (f(transformed + vec3(0.0, 0.0, delta)) - transformed.y) / delta;
        vNormal = (vec3(dxy, 1.0, dxz));
      `,
    );
    material.userData = { shader };
  }

  $: {
    console.log('shader update', glsl);
    material.customProgramCacheKey = () => glsl;
    material.onBeforeCompile = onBeforeCompile;
  }

  $: if (material.userData.shader) {
    console.log('uniform update');
    symbols.forEach((symbol) => {
      material.userData.shader.uniforms[symbol] = { value: values[symbol] || 0 };
    });
    material.userData.shader.uniforms.point.value = point;
    material.userData.shader.needsUpdate = true;
    material.needsUpdate = true;
    material.wireframe = wireframe;
  }
</script>

<T.Mesh frustumCulled={false} args={[geometry, material]} />
