<svelte:head>
  <title>Plotty - Bézier</title>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { browser } from "$app/env";
  import { FormGroup, Header, HeaderAction, HeaderUtilities, NumberInput } from "carbon-components-svelte";
  import SettingsAdjust20 from "carbon-icons-svelte/lib/SettingsAdjust20";

  let canvas, bezier, isOpen;

  if (browser) {
    onMount(async () => {
      const { Bezier } = await import("../lib/bezier");
      bezier = new Bezier(canvas);
    });
  }
</script>

<canvas bind:this={canvas} />

<Header href="/" company="plotty —" platformName="Bézier">
  <HeaderUtilities>
    <HeaderAction icon={SettingsAdjust20} bind:isOpen>
      <FormGroup noMargin={false}>
        {#if bezier}
          <NumberInput light={false}
                       label="Parameter"
                       min={0}
                       max={1}
                       step={0.01}
                       bind:value={bezier.parameter}
                       on:change={() => bezier.update()} />
        {/if}
      </FormGroup>
    </HeaderAction>
  </HeaderUtilities>
</Header>
