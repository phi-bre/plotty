<script>
  import {
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
    LineDashedMaterial,
    LineSegments,
  } from 'three';
  import { LineInstance } from '@threlte/core';

  export let segments;
  export let colors;
  export let dash = 0.01;

  $: geometry = new BufferGeometry().setFromPoints(segments);
  $: if (colors) {
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  }
  $: material = new LineDashedMaterial({
    dashSize: dash,
    gapSize: dash,
    color: '#222222',
    // vertexColors: !!colors,
  });
  $: console.log(geometry);
  $: line = new LineSegments(geometry, material);
  $: line.computeLineDistances();
</script>

<LineInstance {line} />
