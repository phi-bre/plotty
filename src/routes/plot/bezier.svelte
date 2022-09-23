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

  let rotate = false;
  let resolution = 100;
  let parameter = 0.5;
  let bernstein = false;
  let sliders = true;
  let controls = [new Vector3(0, 1), new Vector3(-0.8, 0), new Vector3(0.8, 0), new Vector3(0, -1)];
  let velocity = 0.001;

  const gray = new Color(0x333333).convertSRGBToLinear();
  const axes = new AxesHelper(10000000).setColors(gray, gray, gray);
  const { start, stop, started } = useFrame(
    () => {
      parameter += velocity;

      if (parameter < 0) {
        parameter = 0;
        velocity = -velocity;
      } else if (parameter > 1) {
        parameter = 1;
        velocity = -velocity;
      }
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
  <span>
    bernstein
    <input
      type="checkbox"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:checked={bernstein}
    />
  </span>
  <span>
    sliders
    <input
      type="checkbox"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:checked={sliders}
    />
  </span>
  <span>
    animate
    <input
      type="checkbox"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      on:click={animate}
    />
  </span><span>
    rotate
    <input
      type="checkbox"
      class="bg-shark px-2 py-1 font-mono text-xs focus:border-malibu rounded border-2 border-shark-400  transition-colors outline-none"
      bind:checked={rotate}
    />
  </span>
  <input type="range" min="0" max="1" step="0.001" bind:value={parameter} disabled={$started} />
</Portal>

<OrthographicCamera position={{ x: 0, y: 0, z: 3 }} lookAt={{ x: 0, y: 0, z: 0 }} zoom="500">
  <OrbitControls autoRotate={rotate} />
</OrthographicCamera>

<MeshInstance mesh={axes} />

<Bezier enableBernstein={bernstein} enableSliders={sliders} {controls} {resolution} {parameter} />
