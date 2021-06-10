<svelte:head>
  <title>Plotty - Mandelbrot</title>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { browser } from "$app/env";

  let canvas, mandelbrot, precision = 300, depth = 50, batch = 100000, blub = true;

  if (browser) {
    onMount(async () => {
      const { Mandelbrot } = await import("../lib/mandelbrot");
      mandelbrot = new Mandelbrot(canvas);
    });
  }

  function update() {
    if (mandelbrot) {
      mandelbrot.blub = blub;
    }
  }
</script>

<canvas bind:this={canvas} />
<div class="menu">
  <input type="checkbox" bind:checked={blub} on:change={update}>
<!--  <input type="range" min="1" max="100000" bind:value={batch} on:input={update}>-->
<!--  <input type="range" min="1" max="1000" bind:value={precision} on:input={update}>-->
<!--  <input type="range" min="4" max="1000" bind:value={depth} on:input={update}>-->
</div>

<style>
    .menu {
        position: fixed;
        top: 10px;
        right: 10px;
    }
</style>
