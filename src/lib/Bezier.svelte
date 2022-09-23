<script>
  import { Line, Mesh, TransformControls } from '@threlte/core';
  import { Color, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';
  import tailwind from 'tailwindcss/colors';
  import DashedLineSegments from '$lib/DashedLineSegments.svelte';

  const colors = [
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
  ].map((color) => new Color(tailwind[color][500]).convertSRGBToLinear());

  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = colors[i];
    colors[i] = colors[j];
    colors[j] = temp;
  }

  export let enableSliders;
  export let enableBernstein;
  export let resolution = 100;
  export let parameter = 0.5;
  export let controls = [];

  function bezier(controls, resolution) {
    const points = [];

    for (let i = 0; i <= resolution; i++) {
      const sliders = triangulate(controls, i / resolution);
      points.push(sliders[sliders.length - 1][0]);
    }

    return points;
  }

  function triangulate(controls, t) {
    const sliders = [controls];

    for (let i = 1; i < controls.length; i++) {
      const points = sliders[i - 1];
      const slider = [];

      for (let j = 0; j < controls.length - i; j++) {
        const point = points[j].clone();
        point.x = (1 - t) * points[j].x + t * points[j + 1].x;
        point.y = (1 - t) * points[j].y + t * points[j + 1].y;
        point.z = (1 - t) * points[j].z + t * points[j + 1].z;
        slider.push(point);
      }

      sliders.push(slider);
    }

    return sliders;
  }

  function binomial(a, b) {
    const numerator = factorial(a);
    const denominator = factorial(a - b) * factorial(b);
    return numerator / denominator;
  }

  function factorial(x) {
    if (x === 0) return 1;
    return x * factorial(x - 1);
  }

  function bernstein_polynomial(i, n, t) {
    const a = Math.pow(1 - t, i);
    const b = Math.pow(t, n - i);
    return binomial(n, i) * a * b;
  }

  function bernstein(curve, t) {
    const deltas = [new Vector3()];

    for (let i = 0; i < curve.length; i++) {
      const scale = bernstein_polynomial(i, curve.length - 1, 1 - t);
      deltas.push(
        curve[i]
          .clone()
          .multiplyScalar(scale)
          .add(deltas[deltas.length - 1]),
      );
    }

    return segment(deltas);
  }

  function segment(line) {
    const result = [];
    for (let i = 1; i < line.length; i++) {
      result.push(line[i - 1]);
      result.push(line[i]);
    }
    return result;
  }

  $: curve = bezier(controls, resolution);
  $: sliders = triangulate(controls, parameter);
  $: vectors = bernstein(controls, parameter);
  $: point = sliders[sliders.length - 1][0];

  let selected;
  let hovered;
  let meshes = [];
</script>

<Mesh geometry={new SphereGeometry(0.005)} position={point} />
<Line points={curve} />

{#if enableSliders}
  <DashedLineSegments segments={sliders.flatMap(segment)} />
{/if}

{#if enableBernstein}
  <DashedLineSegments segments={vectors} {colors} />
{/if}

{#each controls as control, index}
  <Mesh
    position={control}
    geometry={new SphereGeometry(0.005)}
    material={new MeshBasicMaterial({ color: hovered === index ? 'red' : colors[index] })}
    interactive
    bind:mesh={meshes[index]}
    on:pointerenter={() => (hovered = index)}
    on:pointerleave={() => (hovered = null)}
    on:click={() => (selected = index)}
    on:pointerup={() => (selected = null)}
  >
    {#if selected === index}
      <TransformControls on:change={() => (controls[index] = meshes[index].position)} />
    {/if}
  </Mesh>
{/each}
