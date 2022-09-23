<script>
  import { useThrelte } from '@threlte/core';

  const threlte = useThrelte();

  let portal = null;

  $: if (portal) {
    threlte.renderer.domElement.parentElement.prepend(portal);
  }
</script>

<div class="fixed top-4 left-4 w-48 flex flex-col font-mono text-xs" bind:this={portal}>
  <slot />
</div>
