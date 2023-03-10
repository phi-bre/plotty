<script>
  import Graph from '$lib/Graph.svelte';
  import ToggleSwitch from '$lib/ui/ToggleSwitch.svelte';
  import {
    Canvas,
    MeshInstance,
    OrbitControls,
    OrthographicCamera,
    PerspectiveCamera,
  } from '@threlte/core';
  import { Grid } from '@threlte/extras';
  import {
    AxesHelper,
    BoxBufferGeometry,
    BoxGeometry,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    Vector4,
  } from 'three';
  import PyodideWorker from '$lib/pyodide.worker?worker';
  import { browser } from '$app/environment';

  let pyodide;

  if (browser) {
    pyodide = new PyodideWorker();
  }

  let randomize = false;
  let resolution = 100;
  let point = new Vector4(0, 0, 0, 1);
  let controls;
  let camera;
  let rotate = false;
  let formula;
  let values;

  // $: settings = $page.url.searchParams.get('settings');
  // $: console.log(settings);
  // $: if (browser) goto('?settings=' + encodeURIComponent(JSON.stringify({ formula, values })));

  let box = new LineSegments(
    new EdgesGeometry(new BoxBufferGeometry(1, 1, 1)),
    new LineBasicMaterial({ opacity: 0.05, transparent: true }),
  );
  $: {
    box.position.set(point.x, point.y, point.z);
    box.scale.set(point.w, point.w, point.w);
  }

  $: if (controls && camera) {
    point.w = camera.position.distanceTo(controls.target) / 1.5;
  }

  function change() {
    point = point.set(
      controls.target.x,
      controls.target.y,
      controls.target.z,
      camera.position.distanceTo(controls.target) / 1.5,
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

    <!--    <label class="my-2 flex justify-between items-center">-->
    <!--      randomize-->
    <!--      <ToggleSwitch bind:checked={randomize} />-->
    <!--    </label>-->
  </div>

  <Canvas>
    <!-- <OrthographicCamera position={{ x: 0, y: 0, z: 3 }} lookAt={{ x: 0, y: 0, z: 0 }} zoom="500">
      <OrbitControls />
    </OrthographicCamera> -->

    <PerspectiveCamera fov={60} position={{ x: 3, y: 3, z: 3 }} bind:camera>
      <OrbitControls autoRotate={rotate} screenSpacePanning on:change={change} bind:controls />
    </PerspectiveCamera>

    <!--    <T.DirectionalLight castShadow position={[3, 10, 10]} />-->
    <!--    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />-->
    <!--    <T.AmbientLight intensity={0.2} />-->

    <MeshInstance mesh={box} />

    <MeshInstance mesh={new AxesHelper(10000)} />
    <!-- <Grid
      infiniteGrid
      fadeDistance={100000}
      sectionColor="#888888"
      sectionThickness={1}
      cellThickness={0.5}
      followCamera={false}
    /> -->

    <Graph {pyodide} {randomize} {resolution} {point} bind:formula bind:values />

    <!--    <Graph-->
    <!--      portal={false}-->
    <!--      {pyodide}-->
    <!--      {randomize}-->
    <!--      resolution={resolution * 2}-->
    <!--      point={point.clone().multiply(new Vector4(1, 1, 1, 10))}-->
    <!--      bind:formula-->
    <!--      bind:values-->
    <!--    />-->
  </Canvas>
</div>
