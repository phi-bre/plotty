<script lang="ts">
  import { writable } from 'svelte/store';
  import { Canvas, Mesh, OrbitControls, OrthographicCamera } from '@threlte/core';
  import { MeshBasicMaterial, TorusGeometry, Vector3 } from 'three';
  import { Text } from '@threlte/extras';
  import Mandelbrot from '$lib/Mandelbrot.svelte';
  import Julia from '$lib/Julia.svelte';
  import PositionPicker from '$lib/PositionPicker.svelte';
  import font from '../../assets/JetBrainsMono-Regular.ttf';

  let point = writable(new Vector3());
  let camera = null;
  let depth = 300;
</script>

<svelte:head>
  <title>Plotty - Mandelbrot</title>
</svelte:head>

<div class="overflow-hidden w-full h-full min-h-screen">
  <div
    class="fixed top-4 right-4 w-[80vh] h-[80vh] rounded overflow-hidden scale-50 translate-x-1/4 -translate-y-1/4 hover:translate-x-0 hover:translate-y-0 hover:scale-100 hover:bg-shark-500 transition-all"
  >
    <Canvas>
      <OrthographicCamera zoom={200} near={Number.MIN_VALUE}>
        <OrbitControls enableRotate={false} screenSpacePanning={true} />
      </OrthographicCamera>

      <Julia point={$point} {depth} />
    </Canvas>
  </div>

  <Canvas>
    <OrthographicCamera zoom={200} near={Number.MIN_VALUE} far={1000000} bind:camera>
      <OrbitControls
        enableRotate={false}
        screenSpacePanning={true}
        on:change={() => (camera = camera)}
      />
    </OrthographicCamera>

    <PositionPicker position={point}>
      <Text text="Mandelbrot" position={{ x: -2, y: 2 }} {font} />
      <Mandelbrot {depth} />
      <Mesh
        position={$point}
        scale={(1 / (camera?.zoom ?? 0)) * 100}
        geometry={new TorusGeometry(0.05, 0.01, 16, 100)}
        material={new MeshBasicMaterial({ color: 0x888888, alphaTest: 0.5, transparent: true })}
      />
    </PositionPicker>
  </Canvas>
</div>
