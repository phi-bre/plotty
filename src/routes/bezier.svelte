<script>
  import { Canvas, MeshInstance, OrbitControls, PerspectiveCamera } from '@threlte/core';
  import { AxesHelper, Color } from 'three';
  import Bezier from '$lib/Bezier.svelte';

  const gray = new Color(0x333333).convertSRGBToLinear();
  const axes = new AxesHelper(10000000);
  axes.setColors(gray, gray, gray);
</script>

<svelte:head>
  <title>Bézier – plotty.</title>
</svelte:head>

<div class="overflow-hidden w-full h-full min-h-screen">
  <Canvas>
    <PerspectiveCamera position={{ x: 5, y: 5, z: 5 }} lookAt={{ x: 0, y: 0, z: 0 }}>
      <OrbitControls />
    </PerspectiveCamera>

    <MeshInstance mesh={axes} />

    <Bezier />
  </Canvas>
</div>
