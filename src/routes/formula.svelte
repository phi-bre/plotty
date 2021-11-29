<script>
  import { Content, Header, NumberInput, Slider, TextInput, Tile } from "carbon-components-svelte";
  // import katex from "katex";
  import { onMount } from 'svelte';
  import * as THREE from '../lib/three';
  import * as math from 'mathjs';

  let formula = 'sin(x)';
  let invalid = false;
  let canvas = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let geometry = null;
  let material = null;
  let mesh = null;

  function draw(formula) {
    invalid = false;
    try {
      const code = math.compile(formula);
      const points = [];
      const lx = camera.position.x - -camera.left / camera.zoom;
      const rx = camera.position.x + +camera.right / camera.zoom;
      // const ly = camera.position.y - -camera.top / camera.zoom;
      // const ry = camera.position.y + +camera.bottom / camera.zoom;
      const step = 1 / camera.zoom;

      for (let x = lx; x <= rx; x += step) {
        const y = -code.evaluate({ x });
        points.push(new THREE.Vector3(x, y));
      }

      geometry.setFromPoints(points);
      renderer.render(scene, camera);
    } catch (e) {
      console.log(e);
      invalid = true;
    }
  }

    draw(formula);
  onMount(() => {
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

    controls.addEventListener('change', () => {
      draw(formula);
    });

    const resize = () => {
      const parent = canvas.parentElement.getBoundingClientRect();
      canvas.width = parent.width;
      canvas.height = parent.height;
      camera.aspect = canvas.width / canvas.height;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.width, canvas.height);
      draw(formula);
    };
    window.addEventListener('resize', resize);

    resize();
  });

  $: if (canvas) draw(formula);
</script>

<svelte:head>
  <title>Plotty - Formula</title>
  <!--  <script nomodule defer src="https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.js"-->
  <!--          integrity="sha384-lhN3C1JSmmvbT89RGOy6nC8qFBS8X/PLsBWIqiNdD4WGNsYOWpS2Il0x4TBrK8E2" crossorigin="anonymous">-->
  <!--  </script>-->
  <!--  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.css"-->
  <!--        integrity="sha384-WsHMgfkABRyG494OmuiNmkAOk8nhO1qE+Y6wns6v+EoNoTNxrWxYpl5ZYWFOLPCM" crossorigin="anonymous">-->
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
  <!--  <Tile>-->
  <!--    {@html expression(formula)}-->
  <!--  </Tile>-->
  <!--  <Tile>-->
  <!--    {@html solution(formula)}-->
  <!--  </Tile>-->
  <Tile style="padding: 0">
    <canvas bind:this={canvas} style="width: 100%; height: 100%" />
  </Tile>
</Content>
