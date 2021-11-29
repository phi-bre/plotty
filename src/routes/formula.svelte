<script>
  import { Content, Header, NumberInput, TextInput, Tile } from 'carbon-components-svelte';
  import katex from 'katex';
  import { onMount } from 'svelte';
  import * as THREE from '../lib/three';
  import * as math from 'mathjs';
  import { muffle } from '../lib/utils';

  let canvas = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let geometry = null;
  let material = null;
  let invalid = false;
  let mesh = null;
  let formula = 'sin(x) + a';
  $: parsed = muffle(() => math.parse(formula));
  $: compiled = muffle(() => parsed.compile());
  $: tex = parsed ? katex.renderToString(parsed.toTex(), { throwOnError: false }) : '';
  $: scope = parsed
    ? Object.fromEntries(
        parsed
          .filter((node) => node.isSymbolNode && node.name.length === 1 && node.name !== 'x')
          .map((node) => [node.name, 0]),
      )
    : {};
  $: if (canvas) draw(formula);
  onMount(setup);

  function setup() {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    camera = new THREE.OrthographicCamera(
      canvas.width / -1,
      canvas.width / +1,
      canvas.height / -1,
      canvas.height / +1,
      Number.MIN_VALUE,
      Number.MAX_VALUE,
    );
    camera.lookAt(0, 0, 0);

    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableRotate = false;
    controls.screenSpacePanning = true;

    scene = new THREE.Scene();

    const grid = new THREE.GridHelper(1000, 2 * 4, 0x333333, 0x151515);
    grid.rotateX(Math.PI / 2);
    scene.add(grid);

    material = new THREE.LineBasicMaterial({ color: 0x5dadff });
    geometry = new THREE.BufferGeometry();
    mesh = new THREE.Line(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    controls.addEventListener('change', draw);
    window.addEventListener('resize', resize);
    resize();
  }

  function resize() {
    const parent = canvas.parentElement.getBoundingClientRect();
    canvas.width = parent.width;
    canvas.height = parent.height;
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
    draw();
  }

  function draw() {
    if (!compiled) return;

    invalid = false;
    try {
      const lx = camera.position.x - -camera.left / camera.zoom;
      const rx = camera.position.x + +camera.right / camera.zoom;
      const step = (1 / camera.zoom) * 2;
      const points = [];

      for (let x = lx; x <= rx; x += step) {
        const y = -compiled.evaluate({ ...scope, x });
        points.push(new THREE.Vector3(x, y));
      }

      geometry.setFromPoints(points);
      renderer.render(scene, camera);
    } catch (e) {
      console.error(e);
      invalid = true;
    }
  }

  function setScopeValue(variable, value) {
    scope[variable] = value;
    draw();
  }
</script>

<svelte:head>
  <title>Plotty - Formula</title>
  <script
    nomodule
    defer
    src="https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.js"
    integrity="sha384-lhN3C1JSmmvbT89RGOy6nC8qFBS8X/PLsBWIqiNdD4WGNsYOWpS2Il0x4TBrK8E2"
    crossorigin="anonymous">
  </script>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.css"
    integrity="sha384-WsHMgfkABRyG494OmuiNmkAOk8nhO1qE+Y6wns6v+EoNoTNxrWxYpl5ZYWFOLPCM"
    crossorigin="anonymous"
  />
</svelte:head>

<Header href="/" company="plotty —" platformName="Formula" />

<Content>
  <TextInput
    id="formula"
    invalidText="Your formula seems invalid"
    labelText="Formula"
    placeholder="2 + 2"
    {invalid}
    bind:value={formula}
  />
  {#each Object.entries(scope) as [variable, value]}
    <NumberInput
      label={variable}
      {value}
      on:input={(e) => setScopeValue(variable, e.target.value)}
      on:change={(e) => setScopeValue(variable, e.detail)}
    />
  {/each}
  <Tile>{@html tex}</Tile>
  <Tile style="padding: 0">
    <canvas bind:this={canvas} style="width: 100%; height: 100%" />
  </Tile>
</Content>
