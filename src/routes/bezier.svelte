<svelte:head>
  <title>Plotty - Bézier</title>
</svelte:head>

<script>
  import { onMount } from "svelte";

  let canvas, bezier;

  onMount(async () => {
    const { Bezier } = await import("../lib/bezier");
    bezier = new Bezier(canvas);

    // setInterval(() => {
    //   bezier.parameter = (bezier.parameter + 0.001) % 1;
    //   bezier.update();
    // }, 10);
  });
</script>

<canvas bind:this={canvas} />
{#if bezier}
  <div class="menu">
    <input type="range" min="0" max="1" step="0.01" bind:value={bezier.parameter} on:input={() => bezier.update()}>
  </div>
{/if}

<style>
    .menu {
        position: fixed;
        top: 10px;
        right: 10px;
    }
</style>
