<script>
  import { BufferGeometry, Float32BufferAttribute, LineDashedMaterial, LineSegments } from 'three';
  import { LineInstance } from '@threlte/core';

  export let segments;
  export let colors;
  export let dash = 0.01;

  const geometry = new BufferGeometry();
  const material = new LineDashedMaterial({
    color: '#222222',
    // vertexColors: !!colors,
  });
  const line = new LineSegments(geometry, material);

  $: {
    // .flatMap((color) => [color, color])
    geometry.setFromPoints(segments);
    material.dashSize = dash;
    material.gapSize = dash;
    line.computeLineDistances();
  }
</script>

<LineInstance {line} />
