<script>
  import Portal from './Portal.svelte';
  import { Points, ShaderMaterial, Color, Vector4, BufferGeometry } from 'three';
  import { MeshInstance, T, Three } from '@threlte/core';
  import { IndexedBufferGeometry } from '$lib/utils.js';
  import PyodideWorker from '$lib/pyodide.worker?worker';
  import Numerical from './ui/Numerical.svelte';
  import CodeMirror from './ui/CodeMirror.svelte';

  export let portal = true;
  export let formula = '(a * y) / (x * x + y * y)';
  export let values = {};
  export let resolution = 100;
  export let randomize = false;
  export let point = new Vector4(0, 0, 0, 1);
  export let color = '#ffffff';

  let pyodide = new PyodideWorker();
  let loading = true;
  let symbols = [];
  let compiled = '0.0';
  let error = null;

  $: {
    pyodide.postMessage({ formula });
    loading = true;
  }

  pyodide.addEventListener('message', ({ data }) => {
    if (data.error) {
      error = data.error;
    } else {
      compiled = data.compiled;
      symbols = data.symbols.filter((i) => i !== 'x' && i !== 'y').sort();
      error = null;
    }
    console.log(data);
    loading = false;
  });

  let geometry = new IndexedBufferGeometry();
  let material = new ShaderMaterial({ transparent: true });

  $: {
    console.log('geometry update');
    geometry.length = resolution * resolution;
  }
  $: {
    console.log('uniform update');
    symbols.forEach((symbol) => (material.uniforms[symbol] = { value: values[symbol] || 0 }));
    material.uniforms.resolution = { value: resolution };
    material.uniforms.randomize = { value: randomize };
    material.uniforms.point = { value: point };
    material.uniforms.color = { value: new Color(color) };
  }
  $: {
    console.log('shader update');
    material.vertexShader = `
      uniform vec4 point;
      uniform bool randomize;
      uniform int resolution;

      ${symbols.map((symbol) => `uniform float ${symbol};`).join('')}

      varying vec3 pos;

      float rand(vec2 seed) {
        return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float f(vec3 voxel) {
        float x = voxel.x;
        float y = voxel.z;
        return (${compiled});
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
  }
</script>

{#if portal}
  <Portal id="target">
    <Numerical name="resolution" bind:value={resolution} min={10} max={1000} step={10} />

    <label class="my-2 flex justify-between items-center">
      color
      <input class="bg-transparent rounded" type="color" bind:value={color} />
    </label>
    <label class="my-2 flex justify-between items-center">
      <CodeMirror
        class="cursor-text w-full font-mono text-xs focus-within:border-malibu rounded border-2 border-transparent transition-colors outline-none rounded-md overflow-hidden {error
          ? '!border-red-500'
          : ''} {loading ? '!border-orange-500' : ''}"
        bind:value={formula}
      />
    </label>

    {#each symbols as symbol}
      <hr class="border-shark" />
      <Numerical name={symbol} bind:value={values[symbol]} />
    {/each}
  </Portal>
{/if}

<T.Points frustumCulled={false} args={[geometry, material]} />
