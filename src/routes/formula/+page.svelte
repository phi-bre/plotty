<script>
  import Graph from '$lib/Graph.svelte';
  import { Canvas, OrbitControls, OrthographicCamera, PerspectiveCamera, T } from '@threlte/core';
  import { BoxGeometry, Vector4 } from 'three';
  import { browser } from '$app/environment';
  import { onDestroy } from 'svelte';
  import ToggleSwitch from '$lib/ui/ToggleSwitch.svelte';
  import Numerical from '$lib/ui/Numerical.svelte';
  import CodeMirror from '$lib/ui/CodeMirror.svelte';
  import PyodideWorker from '$lib/pyodide.worker?worker';
  import MathjsWorker from '$lib/mathjs.worker?worker';
  import Portal from '$lib/Portal.svelte';

  let randomize = false;
  let resolution = 100;
  let point = new Vector4(0, 0, 0, 1);
  let wireframe = false;
  let ortho = false;
  // let formula = 'sin(x * 2)';
  // let formula = '(a * y) / (x * x + y * y)';
  // let formula = '((x+3)/(6-x**2)**(Rational('1.5'))).integrate()';
  let formula =
    'a * (3 * (1 - x) ** 2 * exp(-(x ** 2) - (y + 1) ** 2) - 10 * (x / 5 - x ** 3 - y ** 5) * exp(-x ** 2 - y ** 2)  - 1 / 3 * exp(-(x + 1) ** 2 - y ** 2))'.replace(
      /\*\*/g,
      '^',
    );
  let loading = true;
  let symbols = [];
  let values = {};
  let glsl = '0.0';
  let error = null;
  let controls;
  let camera;
  let worker;

  // a * (3. * pow((1. - x), 2.) * exp((pow(x, 2.)) -  - pow((y + 1.), 2.)) - 10. * (x / 5. - pow(x, 3.) - pow(y, 5.)) * exp(pow(x, 2.) -  - pow(y, 2.)) - 1. / 3. * exp(pow((x + 1.), 2.) -  - pow(y, 2.)))
  // a*(3.*pow(1. - x, 2.)*exp(-pow(x, 2.) - pow(y + 1., 2.)) - (-10.*pow(x, 3.) + 2.*x - 10.*pow(y, 5.))*exp(-pow(x, 2.) - pow(y, 2.)) - 0.33333333333333331*exp(-pow(y, 2.) - pow(x + 1., 2.)))

  if (browser) {
    // worker = new PyodideWorker();
    worker = new MathjsWorker();
    worker.addEventListener('message', listener);
    onDestroy(() => worker.removeEventListener('message', listener));
    function listener({ data }) {
      if (data.error) {
        error = data.error;
      } else {
        glsl = data.glsl;
        symbols = data.symbols.filter((i) => i !== 'x' && i !== 'y').sort();
        error = null;
      }
      console.log(data);
      loading = false;
    }
  }

  $: if (browser && worker) {
    worker.postMessage({ formula });
    loading = true;
  }

  $: if (controls && camera) {
    point.w = ortho ? 1000 / camera.zoom : camera.position.distanceTo(controls.target) / 1.5;
  }

  function change() {
    point = point.set(
      controls.target.x,
      controls.target.y,
      controls.target.z,
      ortho ? 1000 / camera.zoom : camera.position.distanceTo(controls.target) / 1.5,
    );
  }
</script>

<svelte:head>
  <title>Plotty - Formula</title>
</svelte:head>

<div class="overflow-hidden w-full h-full min-h-screen">
  <div
    id="target"
    class="fixed top-4 left-4 rounded font-mono text-xs bg-shark-600 bg-opacity-25 p-3 px-4 w-96"
  >
    <a href="/">
      <h2 class="mb-2">plotty<span class="text-malibu">.</span></h2>
    </a>

    <hr class="border-shark" />
  </div>

  <Canvas>
    <Portal id="target">
      <label class="my-2 flex justify-between items-center">
        wireframe
        <ToggleSwitch bind:checked={wireframe} />
      </label>

      <Numerical name="resolution" bind:value={resolution} min={10} max={1000} step={1} />

      <hr class="border-shark" />

      <label class="my-2 flex justify-between items-center">
        <CodeMirror
          class="cursor-text w-full font-mono text-xs focus-within:border-malibu border-2 border-transparent transition-colors outline-none rounded-md overflow-hidden {error
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

    {#if ortho}
      <OrthographicCamera
        bind:camera
        position={{ x: 0, y: 0, z: 3 }}
        lookAt={{ x: 0, y: 0, z: 0 }}
        zoom={500}
      >
        <OrbitControls on:change={change} bind:controls />
      </OrthographicCamera>
    {:else}
      <PerspectiveCamera fov={60} position={{ x: 3, y: 3, z: 3 }} bind:camera>
        <OrbitControls screenSpacePanning on:change={change} bind:controls />
      </PerspectiveCamera>
    {/if}

    <T.LineSegments position={[point.x, point.y, point.z]} scale={[point.w, point.w, point.w]}>
      <T.EdgesGeometry args={[new BoxGeometry(1, 1, 1)]} />
      <T.LineBasicMaterial opacity={0.05} transparent />
    </T.LineSegments>

    <T.AxesHelper args={[10000]} />

    <Graph {randomize} {resolution} {point} {wireframe} {glsl} {values} {symbols} />
  </Canvas>
</div>
