<script>
  import { Canvas, MeshInstance, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@threlte/core';
  import Graph from '$lib/Graph.svelte';
  import { Grid } from '@threlte/extras';
  import { Vector4 } from 'three';

  let formula = `(2.0 * y) / (x * x + y * y)`;
  let randomize = true;
  let resolution = 100;
  let point = new Vector4(0, 0, 0, 1);
</script>

<svelte:head>
  <title>Plotty - Formula</title>
</svelte:head>

<div class="overflow-hidden w-full h-full min-h-screen">
  <label>
    <input
      type="text"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:value={formula}
    />
  </label>
  <label>
    randomize
    <input
      type="checkbox"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:checked={randomize}
    />
  </label>
  <label>
    resolution
    <input
      type="range"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:value={resolution}
    />
  </label>
  <label>
    size
    <input
      type="range"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:value={point.w}
    />
  </label>

  <Canvas>
    <!-- <OrthographicCamera position={{ x: 0, y: 0, z: 3 }} lookAt={{ x: 0, y: 0, z: 0 }} zoom="500">
      <OrbitControls />
    </OrthographicCamera> -->

    <PerspectiveCamera fov={60} position={{ x: 3, y: 3, z: 3 }} lookAt={{ x: 0, y: 0, z: 0 }}>
      <OrbitControls screenSpacePanning />
    </PerspectiveCamera>

    <!--    <MeshInstance mesh={new AxesHelper(10000000)} />-->
    <Grid infiniteGrid fadeDistance={100} />

    <Graph {formula} {randomize} {resolution} {point} />
  </Canvas>
</div>
