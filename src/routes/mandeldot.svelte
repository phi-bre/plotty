<script>
  import {
    Canvas,
    Group,
    MeshInstance,
    OrbitControls,
    OrthographicCamera,
    PerspectiveCamera,
  } from '@threlte/core';
  import {
    BoxBufferGeometry,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    Vector4,
  } from 'three';
  import Mandeldot from '$lib/Mandeldot.svelte';
  import Mandelbrot from '$lib/Mandelbrot.svelte';

  let rotate = true;
  let imaginary = true;
  let randomize = true;
  let depth = 256;
  let resolution = 128;
  let point = new Vector4();
  let camera = null;

  const box = new LineSegments(
    new EdgesGeometry(new BoxBufferGeometry(1, 1, 1)),
    new LineBasicMaterial({ opacity: 0.2, transparent: true }),
  );

  const view = 100;
  const near = 0.000000000001;
  const far = 100000000000;
</script>

<div class="overflow-hidden w-full h-full min-h-screen">
  <div class="fixed top-4 left-4 w-48 flex flex-col">
    <input type="range" min="1" max="800" bind:value={resolution} />
    <input type="range" min="2" max="1000" bind:value={depth} />
    <span class="font-mono text-xs">resolution: {resolution}</span>
    <span class="font-mono text-xs">({Math.round((resolution ** 3 * 4) / 1e6)} MB)</span>
    <span class="font-mono text-xs">points: {resolution ** 3}</span>
    <span class="font-mono text-xs">depth: {depth}</span>
    <span class="font-mono text-xs">
      rotate: <input type="checkbox" bind:checked={rotate} />
    </span>
    <span class="font-mono text-xs">
      imaginary: <input type="checkbox" bind:checked={imaginary} />
    </span>
    <span class="font-mono text-xs">
      randomize: <input type="checkbox" bind:checked={randomize} />
    </span>
    <span class="font-mono text-xs">
      x: <input
        type="number"
        class="inline-block w-24 bg-transparent truncate"
        step={0.1}
        bind:value={point.x}
      />
    </span>
    <span class="font-mono text-xs">
      y: <input
        type="number"
        class="inline-block w-24 bg-transparent truncate"
        step={0.1}
        bind:value={point.y}
      />
    </span>
    <span class="font-mono text-xs">
      z: <input
        type="number"
        class="inline-block w-24 bg-transparent truncate"
        step={0.1}
        bind:value={point.z}
      />
    </span>
    <span class="font-mono text-xs">
      s: <input
        type="number"
        class="inline-block w-24 bg-transparent truncate"
        step={0.1}
        bind:value={point.w}
      />
    </span>
  </div>

  <div class="fixed top-4 right-4 w-96 h-96 border-shark-400 border-2 rounded">
    <Canvas>
      <OrthographicCamera
        bind:camera
        position={{ z: 10 }}
        zoom={100}
        left={-view}
        right={view}
        top={view}
        bottom={-view}
        {near}
        {far}
      >
        <OrbitControls
          enableRotate={false}
          screenSpacePanning={true}
          on:change={() => {
            point = point.set(camera.position.x, camera.position.y, 0, 1 / (camera.zoom / 100));
          }}
        />
      </OrthographicCamera>

      <Mandelbrot {depth} />
    </Canvas>
  </div>

  <Canvas>
    <PerspectiveCamera position={{ x: 1, y: 1, z: 1 }} fov={75} {near} {far}>
      <OrbitControls enablePan={false} autoRotate={rotate} autoRotateSpeed={0.1} />
    </PerspectiveCamera>

    <Group frustumCulled={false} rotation={{ x: Math.PI / 2 }}>
      <Mandeldot {resolution} {point} {depth} {imaginary} {randomize} />
    </Group>

    <MeshInstance mesh={box} />
  </Canvas>
</div>
