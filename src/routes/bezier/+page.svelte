<script>
  import {
    MeshInstance,
    OrbitControls,
    OrthographicCamera,
    PerspectiveCamera,
    useFrame,
  } from '@threlte/core';
  import { AxesHelper, Color, Vector3 } from 'three';
  import Bezier from '$lib/Bezier.svelte';
  import Portal from '$lib/Portal.svelte';
  import ToggleSwitch from '$lib/ui/ToggleSwitch.svelte';

  let orthogonal = false;
  let rotate = false;
  let resolution = 100;
  let parameter = 0.5;
  let bernstein = false;
  let sliders = true;
  let velocity = 0.001;
  let controls = [
    new Vector3(-0.5, -0.5),
    new Vector3(-0.5, 0.5),
    new Vector3(0.5, 0.5),
    new Vector3(0.5, -0.5),
  ];

  const gray = new Color(0x333333).convertSRGBToLinear();
  const axes = new AxesHelper(10000000).setColors(gray, gray, gray);
  const { start, stop, started } = useFrame(
    () => {
      parameter = Math.min(1, Math.max(0, parameter + velocity));
      velocity = parameter === 1 || parameter === 0 ? -velocity : velocity;
    },
    {
      autostart: false,
    },
  );
  const animate = () => ($started ? stop : start)();
</script>

<svelte:head>
  <title>Bézier – plotty.</title>
</svelte:head>

<Portal>
  <div
    class="fixed top-4 left-4 rounded font-mono text-xs bg-shark-600 bg-opacity-25 p-3 px-4 w-64"
  >
    <a href="/">
      <h2 class="mb-2">plotty<span class="text-malibu">.</span></h2>
    </a>

    <hr class="border-shark" />

    <span class="my-2 flex justify-between items-center">
      orthogonal
      <ToggleSwitch bind:checked={orthogonal} />
    </span>

    <span class="my-2 flex justify-between items-center">
      bernstein
      <ToggleSwitch bind:checked={bernstein} />
    </span>

    <span class="my-2 flex justify-between items-center">
      sliders
      <ToggleSwitch bind:checked={sliders} />
    </span>

    <span class="my-2 flex justify-between items-center">
      animate
      <ToggleSwitch checked={$started} on:click={animate} />
    </span>

    <span class="my-2 flex justify-between items-center">
      rotate
      <ToggleSwitch bind:checked={rotate} />
    </span>

    <span class="my-2 flex justify-between items-center">
      parameter
      <input type="range" min={0} max={1} step={0.001} bind:value={parameter} disabled={$started} />
    </span>
  </div>
</Portal>

{#if orthogonal}
  <OrthographicCamera position={{ x: 0, y: 0, z: 3 }} lookAt={{ x: 0, y: 0, z: 0 }} zoom="500">
    <OrbitControls autoRotate={rotate} />
  </OrthographicCamera>
{:else}
  <PerspectiveCamera position={{ x: 0, y: 0, z: 3 }} lookAt={{ x: 0, y: 0, z: 0 }} zoom="500">
    <OrbitControls autoRotate={rotate} />
  </PerspectiveCamera>
{/if}

<MeshInstance mesh={axes} />

<Bezier enableBernstein={bernstein} enableSliders={sliders} {controls} {resolution} {parameter} />
