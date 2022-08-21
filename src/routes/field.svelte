<script>
  import { Canvas, OrbitControls, OrthographicCamera } from '@threlte/core';
  import Differential from '$lib/Differential.svelte';
  import { Vector2 } from 'three';
  import PositionPicker from '$lib/PositionPicker.svelte';
  import { writable } from 'svelte/store';

  let point = writable(new Vector2(0, 0));
</script>

<svelte:head>
  <title>Plotty - Differential</title>
</svelte:head>

<div class="overflow-hidden w-full h-full min-h-screen">
  <Canvas>
    <OrthographicCamera zoom={200} near={Number.MIN_VALUE} far={1000000}>
      <OrbitControls enableRotate={false} screenSpacePanning={true} />
    </OrthographicCamera>

    <PositionPicker position={point} />
    <Differential point={$point} />
  </Canvas>
</div>
