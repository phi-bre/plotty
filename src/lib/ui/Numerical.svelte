<script>
  import { useFrame } from '@threlte/core';

  export let name;
  export let value = 0.5;
  export let min = -1;
  export let max = 1;
  export let step = 0.001;
  // export let open = false;

  let direction = 1;

  const { start, stop, started } = useFrame(
    () => {
      value = Math.round((value + step * direction) * (1 / step)) / (1 / step); // Round to step precision
      direction = value > max || value < min ? -direction : direction; // Reverse velocity when value reaches min or max
    },
    {
      autostart: false,
    },
  );
</script>

<div class="my-2">
  <span class="flex justify-between select-none">
    <span class="flex items-center">
      <span>{name}</span>
      <!-- <span
        class="h-4 w-5 text-center material-symbols-rounded text-lg cursor-pointer leading-none"
        on:click={() => (open = !open)}
      >
        {#if open}expand_less{:else}expand_more{/if}
      </span> -->
      <span
        class="h-4 w-5 text-center material-symbols-rounded text-malibu-500 text-lg cursor-pointer leading-none"
        on:click={$started ? stop : start}
      >
        {#if $started}
          pause
        {:else}
          play_arrow
        {/if}
      </span>
      <input
        type="text"
        class="outline-none"
        bind:value={step}
        min="0"
        max={max - min}
        size={`${value}`.length}
      />
    </span>
    <input type="text" class="text-right outline-none" bind:value size={`${value}`.length} />
  </span>
  <!-- {#if open} -->
  <span class="py-2 flex gap-2 justify-between items-center">
    <input class="text-left" type="text" bind:value={min} size={`${min}`.length} />
    <input class="grow" type="range" {min} {max} {step} bind:value on:input={stop} />
    <input class="text-right" type="text" bind:value={max} size={`${max}`.length} />
  </span>
  <!-- {/if} -->
</div>

<style>
  input {
    @apply bg-transparent rounded;
  }
</style>
