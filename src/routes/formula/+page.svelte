<script>
  import {
    Canvas,
    MeshInstance,
    OrbitControls,
    OrthographicCamera,
    PerspectiveCamera,
  } from '@threlte/core';
  import Graph from '$lib/Graph.svelte';
  import { Grid } from '@threlte/extras';
  import {
    BoxBufferGeometry,
    BoxGeometry,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    Vector4,
  } from 'three';

  let formula = `(2.0 * y) / (x * x + y * y)`;
  let randomize = true;
  let resolution = 100;
  let point = new Vector4(0, 0, 0, 1);
  let controls;
  let camera;

  let box = new LineSegments(
    new EdgesGeometry(new BoxBufferGeometry(1, 1, 1)),
    new LineBasicMaterial({ opacity: 0.2, transparent: true }),
  );
  $: {
    box.position.set(point.x, point.y, point.z);
    box.scale.set(point.w, point.w, point.w);
  }

  $: if (controls && camera) {
    point.w = camera.position.distanceTo(controls.target) / 2;
  }

  function change() {
    point = point.set(
      controls.target.x,
      controls.target.y,
      controls.target.z,
      camera.position.distanceTo(controls.target) / 2,
    );
  }
</script>

<svelte:head>
  <title>Plotty - Formula</title>
</svelte:head>

<div class="overflow-hidden w-full h-full min-h-screen">
  <div class="fixed">
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
      resolution: {resolution}
      <br />
      <input
        type="range"
        class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
        bind:value={resolution}
        min="10"
        max="10000"
      />
    </label>
  </div>

  <Canvas>
    <!-- <OrthographicCamera position={{ x: 0, y: 0, z: 3 }} lookAt={{ x: 0, y: 0, z: 0 }} zoom="500">
      <OrbitControls />
    </OrthographicCamera> -->

    <PerspectiveCamera fov={60} position={{ x: 3, y: 3, z: 3 }} bind:camera>
      <OrbitControls screenSpacePanning on:change={change} bind:controls />
    </PerspectiveCamera>

    <MeshInstance mesh={box} />

    <!--    <MeshInstance mesh={new AxesHelper(10000000)} />-->
    <!--    <Grid-->
    <!--      infiniteGrid-->
    <!--      fadeDistance={100}-->
    <!--      sectionColor="#111"-->
    <!--      sectionThickness={1}-->
    <!--      cellThickness={0.5}-->
    <!--      followCamera={false}-->
    <!--    />-->

    <Graph {formula} {randomize} {resolution} {point} />
  </Canvas>
</div>
