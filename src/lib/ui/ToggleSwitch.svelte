<script>
  export let checked;
</script>

<div>
  <label class="relative mx-1 block flex cursor-pointer items-center">
    <input
      type="checkbox"
      class="peer sr-only"
      bind:checked
      {...$$props}
      on:input
      on:change
      on:click
    />
    <span
      class="peer h-5 w-9 rounded-full bg-shark-400 transition-all after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-malibu peer-checked:after:translate-x-full peer-checked:after:border-white"
    />
  </label>
</div>
