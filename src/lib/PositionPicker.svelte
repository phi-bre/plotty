<script>
  import { useThrelte } from '@threlte/core';
  import { Vector3 } from 'three';

  const { camera, pointer, pointerOverCanvas } = useThrelte();

  export let position;

  let change = false;

  function move(event) {
    if (!$pointerOverCanvas || !change || event.buttons !== 1) return;
    $position = new Vector3($pointer.x, $pointer.y, -1).unproject($camera);
  }
</script>

<svelte:window
  on:pointerdown={() => (change = true)}
  on:pointerup={() => (change = false)}
  on:pointermove={move}
/>

<slot />
