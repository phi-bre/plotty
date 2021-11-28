<script>
  import { Content, Header, TextInput, Tile } from 'carbon-components-svelte';
  // import katex from "katex";
  import * as math from 'mathjs';
  import { onMount } from 'svelte';

  let iterations = 1000;
  let formula = 'sin(x) + 40';
  let invalid = false;
  let canvas = null;

  // function expression(value) {
  //   return katex.renderToString(formula, { throwOnError: false });
  // }

  // function solution(value) {
  //   invalid = false;
  //   try {
  //     return math.evaluate(formula, { a: 10 });
  //   } catch {
  //     invalid = true;
  //     return "";
  //   }
  // }

  function draw(formula) {
    invalid = false;
    try {
      const code = math.compile(formula);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#5dadff';
      ctx.beginPath();
      for (let i = 0; i < iterations; i++) {
        const x = (canvas.width * i) / iterations;
        const y = -code.evaluate({ x }) + canvas.height;
        ctx.lineTo(x, y, 1, 1);
      }
      ctx.stroke();
    } catch {
      invalid = true;
    }
  }

  onMount(() => {
    draw(formula);
  });

  $: draw(formula);
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
  <Tile>
    <canvas bind:this={canvas} width="400" height="400" />
  </Tile>
</Content>
