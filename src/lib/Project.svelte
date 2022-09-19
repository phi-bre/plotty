<script>
  import { faWaveSquare } from '@fortawesome/free-solid-svg-icons';
  import { goto } from '$app/navigation';
  import Icon from 'fa-svelte';

  export let href;
  export let name;
  export let badge;
  export let description;
</script>

<div
  class="px-6 py-4 cursor-pointer rounded-lg bg-[#292c2e] hover:bg-[#2c2f33] transition-colors select-none overflow-hidden"
  on:click={() => goto(href)}
>
  <div class="mb-2 flex items-center justify-between">
    <Icon icon={faWaveSquare} width="64" />
    <h3 class="mx-2 font-bold truncate flex-grow">{name}</h3>
    {#if badge}
      <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full text-malibu bg-malibu/25">
        {badge}
      </span>
    {/if}
  </div>
  <p class="text-xs mb-2 mt-4 font-medium text-gray-400 truncate">{description}</p>
</div>
