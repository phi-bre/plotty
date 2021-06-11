<svelte:head>
  <title>Plotty - Mandelbrot</title>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { browser } from "$app/env";

  let canvas, mandelbrot, precision = 300, batch = 100000, blub = true;

  if (browser) {
    onMount(async () => {
      const { Mandelbrot } = await import("../lib/mandelbrot");
      mandelbrot = new Mandelbrot(canvas);
    });
  }
</script>

<canvas bind:this={canvas} on:wheel={event => mandelbrot.scale = -event.deltaY} />
<div class="menu">
<!--  <input type="checkbox" bind:checked={blub} on:change={update}>-->
  {#if mandelbrot}
    <input type="range" min="1" max="400" bind:value={mandelbrot.depth}>
  {/if}
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
