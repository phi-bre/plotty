<script>
  import {
    Accordion,
    AccordionItem,
    Column,
    Content,
    Form,
    FormGroup,
    Grid,
    Header,
    NumberInput,
    Row,
    TextInput,
    Tile,
  } from 'carbon-components-svelte';
  import katex from 'katex';
  import 'katex/dist/katex.css';
  import { onMount } from 'svelte';
  import * as math from 'mathjs';
  import { muffle } from '$lib/utils';

  let THREE;
  let canvas = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let geometry = null;
  let material = null;
  let invalid = false;
  let mesh = null;
  let formula = 'sin(x) + a'; // abs(sin(x^x)/2^((x^x-pi/2)/pi))
  let iterations = 300;
  $: parsed = muffle(() => math.parse(formula));
  $: compiled = muffle(() => parsed.compile());
  $: tex = parsed
    ? katex.renderToString(parsed.toTex(), { throwOnError: false, displayMode: true, output: 'html' })
    : '';
  $: scope = parsed
    ? Object.fromEntries(
        parsed
          .filter((node) => node.isSymbolNode && node.name.length === 1 && node.name !== 'x')
          .map((node) => [node.name, 0]),
      )
    : {};
  $: if (canvas) draw(formula, iterations);
  onMount(setup);

  async function setup() {
    THREE = await import('$lib/three');
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
      const step = 1 / camera.zoom;
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
</svelte:head>

<Header href="/" company="plotty —" platformName="Formula" />

<Content style="background-color: transparent">
  <Grid fullWidth>
    <Row>
      <Column style="min-height: 80vh">
        <canvas bind:this={canvas} style="width: 100%; height: 100%" />
      </Column>
      <Column style="max-width: 340px">
        <TextInput
          id="formula"
          labelText="Formula"
          invalidText="Your formula seems invalid"
          placeholder="2 + 2"
          {invalid}
          bind:value={formula}
        />
        <Tile style="display: flex; justify-content: center; align-items: center">
          {@html tex}
        </Tile>
        <br />
        <Form>
          <FormGroup legendText="Variables {Object.keys(scope).join()}">
            {#each Object.entries(scope) as [variable, value]}
              <NumberInput
                {value}
                on:input={(e) => setScopeValue(variable, e.target.value)}
                on:change={(e) => setScopeValue(variable, e.detail)}
              />
            {/each}
          </FormGroup>
        </Form>
        <br />
        <Accordion>
          <AccordionItem title="Advanced">
            <NumberInput label="Iterations" value={iterations} />
          </AccordionItem>
        </Accordion>
      </Column>
    </Row>
  </Grid>
</Content>
