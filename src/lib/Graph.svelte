<script>
  import Portal from './Portal.svelte';
  import {
    Points,
    ShaderMaterial,
    Color,
    Vector4,
    BufferGeometry,
    PlaneGeometry,
    MeshBasicMaterial,
    DoubleSide,
    MeshNormalMaterial,
  } from 'three';
  import { MeshInstance, T, Three, useThrelte } from '@threlte/core';
  import { IndexedBufferGeometry } from '$lib/utils.js';
  import Numerical from './ui/Numerical.svelte';
  import CodeMirror from './ui/CodeMirror.svelte';
  import ToggleSwitch from '$lib/ui/ToggleSwitch.svelte';
  import { onDestroy } from 'svelte';

  export let portal = true;
  // export let formula = 'sin(x * 2)';
  // export let formula = '(a * y) / (x * x + y * y)';
  export let formula =
    'a *(3*(1-x)**2*exp(-(x**2) - (y+1)**2) - 10*(x/5 - x**3 - y**5)*exp(-x**2-y**2)  - 1/3*exp(-(x+1)**2 - y**2))';
  // ((x+3)/(6-x**2)**(Rational('1.5'))).integrate()
  export let values = {};
  export let resolution = 100;
  export let randomize = false;
  export let wireframe = false;
  export let point = new Vector4(0, 0, 0, 1);
  export let pyodide;

  let loading = true;
  let symbols = [];
  let compiled = '0.0';
  let error = null;

  pyodide.addEventListener('message', listener);
  onDestroy(() => pyodide.removeEventListener('message', listener));
  $: {
    pyodide.postMessage({ formula });
    loading = true;
  }
  function listener({ data }) {
    if (data.error) {
      error = data.error;
    } else {
      compiled = data.compiled;
      symbols = data.symbols.filter((i) => i !== 'x' && i !== 'y').sort();
      error = null;
    }
    console.log(data);
    loading = false;
  }

  // $: geometry = new IndexedBufferGeometry();
  $: geometry = new PlaneGeometry(1, 1, resolution, resolution);
  let material;
  // let material = new ShaderMaterial({
  //   transparent: true,
  //   opacity: 0.5,
  //   side: DoubleSide,
  //   wireframe: true,
  // });

  function onBeforeCompile(shader) {
    symbols.forEach((symbol) => (shader.uniforms[symbol] = { value: 0 }));
    shader.uniforms.point = { value: point };
    shader.uniforms.resolution = { value: resolution };
    shader.uniforms.randomize = { value: randomize };
    shader.uniforms.point = { value: point };
    shader.vertexShader = `
        uniform vec4 point;
        uniform bool randomize;
        uniform int resolution;
        ${symbols.map((symbol) => `uniform float ${symbol};`).join('')}

        float f(vec3 voxel) {
          float x = voxel.x;
          float y = voxel.z;
          return (${compiled});
        }

        ${shader.vertexShader}
      `;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        // float i = float(gl_VertexID);
        // float l = float(resolution);
        // vec3 transformed = vec3(i / l, 0.0, mod(i, l)) / float(resolution);
        vec3 transformed = position.xzy;
        // if (randomize) {
        //   transformed += rand(transformed.xy) * (1.0 / float(resolution));
        // }
        // transformed = transformed * point.w + point.xyz;
        transformed = transformed * point.w + point.xyz;// - point.w / 2.0;
        transformed.y = f(transformed);
        // transformed.y = clamp(transformed.y, -point.w / 2.0, point.w / 2.0);
        float delta = point.w / 1000.0;
        float dxy = (f(transformed + vec3(delta, 0.0, 0.0)) - transformed.y) / delta;
        float dxz = (f(transformed + vec3(0.0, 0.0, delta)) - transformed.y) / delta;

        // float epsilon = 0.0001;
        //
        // if (dxy < epsilon && dxy > -epsilon) {
        //   dxy = 0.0;
        // }
        //
        // if (dxz < epsilon && dxz > -epsilon) {
        //   dxz = 0.0;
        // }

        vNormal = (vec3(dxy, 1.0, dxz));

        // gl_PointSize = 1.0;
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      `,
    );
    // shader.fragmentShader = `
    //   varying float visible;
    //
    //   ${shader.fragmentShader}
    // `;
    // shader.fragmentShader = shader.fragmentShader.replace(
    //   '#ifdef OPAQUE\n\t\tgl_FragColor.a = 1.0;\n\t#endi',
    //   '#ifdef OPAQUE\n\t\tgl_FragColor.a = 0.0;\n\t#endi',
    // );
    material.userData = { shader };
  }

  $: {
    console.log('shader update', compiled);
    material = new MeshNormalMaterial({
      depthWrite: false,
      side: DoubleSide,
      wireframe: false,
      transparent: true,
      opacity: 0.75,
    });
    material.onBeforeCompile = onBeforeCompile;
    material.customProgramCacheKey = () => compiled;
  }

  // $: {
  //   console.log('geometry update');
  //   geometry.length = resolution * resolution;
  // }

  $: if (material.userData.shader) {
    console.log('uniform update');
    symbols.forEach((symbol) => {
      material.userData.shader.uniforms[symbol] = { value: values[symbol] };
    });
    material.userData.shader.uniforms.point.value = point;
    material.userData.shader.needsUpdate = true;
    material.needsUpdate = true;
    material.wireframe = wireframe;
  }
</script>

{#if portal}
  <Portal id="target">
    <label class="my-2 flex justify-between items-center">
      wireframe
      <ToggleSwitch bind:checked={wireframe} />
    </label>

    <Numerical name="resolution" bind:value={resolution} min={10} max={1000} step={10} />

    <hr class="border-shark" />

    <label class="my-2 flex justify-between items-center">
      <CodeMirror
        class="cursor-text w-full font-mono text-xs focus-within:border-malibu rounded border-2 border-transparent transition-colors outline-none rounded-md overflow-hidden {error
          ? '!border-red-500'
          : ''} {loading ? '!border-orange-500 animate-pulse' : ''}"
        bind:value={formula}
      />
    </label>

    {#each symbols as symbol}
      <hr class="border-shark" />
      <Numerical name={symbol} bind:value={values[symbol]} />
    {/each}
  </Portal>
{/if}

<!--{#if wireframe}-->
<T.Mesh frustumCulled={false} args={[geometry, material]} />
<!--{:else}-->
<!--  <T.Points frustumCulled={false} args={[geometry, material]} />-->
<!--{/if}-->
