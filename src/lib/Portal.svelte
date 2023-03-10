<script>
  import { useThrelte } from '@threlte/core';

  export let id = null;

  const threlte = useThrelte();

  let portal = null;

  $: if (portal) {
    if (id) {
      document.querySelector('#' + id).append(portal);
    } else {
      threlte.renderer.domElement.parentElement.prepend(portal);
    }
  }
</script>

<div class="contents" bind:this={portal}>
  <slot />
</div>
