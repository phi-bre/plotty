<script>
  import { Canvas, MeshInstance, OrbitControls, OrthographicCamera } from '@threlte/core';
  import Graph from '$lib/Graph.svelte';
  import { Color, GridHelper } from 'three';

  // let a = 1.5;
  // let b = 1.0;
  // let formula = `exp(${a} * (log(abs(x)) + ${b}.0))`;
  let formula = `sin(x)`;
</script>

<svelte:head>
  <title>Plotty - Formula</title>
</svelte:head>

<div class="overflow-hidden w-full h-full min-h-screen">
  <div class="fixed top-4 left-4 w-48 flex flex-col">
    <input
      spellcheck="false"
      type="text"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:value={formula}
    />
  </div>

  <Canvas>
    <OrthographicCamera zoom={50} near={Number.MIN_VALUE} far={1000000}>
      <OrbitControls enableRotate={false} screenSpacePanning={true} />
    </OrthographicCamera>

    <!--    <MeshInstance mesh={new AxesHelper(10000000)} />-->
    <MeshInstance
      mesh={new GridHelper(100, 100, new Color(0x3333333), new Color(0x080808))}
      rotation={{ x: Math.PI / 2 }}
    />
    <Graph {formula} />
  </Canvas>
</div>
