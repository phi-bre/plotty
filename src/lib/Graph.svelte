<script>
  import { Line } from '@threlte/core';
  import { Vector3 } from 'three';
  import { parse } from 'mathjs';

  export let formula = 'sin(x)';
  export let resolution = 100;

  $: parsed = parse(formula);
  $: compiled = parsed.compile();
  $: variables = parsed
    .filter((node) => node.isSymbolNode && node.name.length === 1 && node.name !== 'x')
    .map((node) => [node.name, 0])
    .sort();

  $: points = [];
  $: for (let i = 0; i < resolution; i++) {
    const x = i / resolution;
    const y = compiled.evaluate({ ...Object.fromEntries(variables), x });
    points.push(new Vector3(x, y));
  }

  // const { size } = useThrelte();
  // $: resolution = resolution ?? $size.width;

  // const geometry = new IndexedBufferGeometry(1000);
  // // $: geometry.length = resolution; TODO
  //
  // $: material = new ShaderMaterial({
  //   uniforms: {
  //     resolution: { value: 1000 },
  //   },
  //   vertexShader: `
  //     uniform int resolution;
  //
  //     void main() {
  //       float near = projectionMatrix[3][2] / (projectionMatrix[2][2] - 1.0);
  //       float left = near * (projectionMatrix[2][0] - 1.0) / projectionMatrix[0][0];
  //       float x = float(gl_VertexID) * (left / float(resolution) * 2.0) + cameraPosition.x;
  //
  //       // float error = 2.0 / float(resolution);
  //       // vec3 position = vec3(float(gl_VertexID) / float(resolution), 0, 0) * error - 1.0;
  //       // float x = position.x;
  //
  //       float y = ${formula};
  //
  //       gl_PointSize = 1.0;
  //       gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, 0, 1.0);
  //     }
  //   `,
  //   fragmentShader: `
  //     uniform vec4 color;
  //
  //     void main() {
  //       gl_FragColor = vec4(0.365, 0.678, 1, 0);
  //     }
  //   `,
  // });

  // $: {
  //   material.uniforms.resolution = resolution;
  // }
</script>

<!--{#if mode === 'points'}-->
<!--  <MeshInstance frustumCulled={false} mesh={new Points(geometry, material)} />-->
<!--{:else if mode === 'lines'}-->
<!--  <Line {geometry} {material} />-->
<!--{/if}-->
<!--<Line {geometry} {material} />-->
<!--<MeshInstance frustumCulled={false} mesh={new Points(geometry, material)} />-->
<Line {points} />
