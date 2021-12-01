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
  import 'katex/dist/katex.css';
  import { browser } from "$app/env";
  import { onDestroy, onMount } from "svelte";

  let canvas;
  let formula;
  let store;
  if (browser) {
    onMount(async () => {
      formula = (await import("$lib/formula")).default(canvas);
      store = formula.store;
    });
    onDestroy(() => formula.destroy());
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
      {#if $store}
        <Column style="max-width: 340px">
          <TextInput
            id="formula"
            labelText="Formula"
            invalidText="Your formula seems invalid"
            placeholder="2 + 2"
            value={$store.formula}
            on:input={(e) => formula.setFormula(e.target.value)}
          />
          <Tile style="display: flex; justify-content: center; align-items: center">
            {@html $store.latex}
          </Tile>
          <br />
          <Form>
            <FormGroup legendText="Variables {Object.keys($store.scope).join()}">
              {#each Object.entries($store.scope) as [variable, value]}
                <NumberInput
                  {value}
                  on:input={(e) => formula.setScope(variable, e.target.value)}
                  on:change={(e) => formula.setScope(variable, e.detail)}
                />
              {/each}
            </FormGroup>
          </Form>
          <!--        <br />-->
          <!--        <Accordion>-->
          <!--          <AccordionItem title="Advanced">-->
          <!--            <NumberInput label="Iterations" value={iterations} />-->
          <!--          </AccordionItem>-->
          <!--        </Accordion>-->
        </Column>
      {/if}
    </Row>
  </Grid>
</Content>
