<svelte:head>
  <title>Plotty - Bézier</title>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { browser } from "$app/env";

  let canvas, bezier;

  if (browser) {
    onMount(async () => {
      const { Bezier } = await import("../lib/bezier");
      bezier = new Bezier(canvas);

      setInterval(() => {
        bezier.parameter = (bezier.parameter + 0.001) % 1;
        bezier.update();
      }, 10);
    });
  }
</script>

<canvas bind:this={canvas} />

