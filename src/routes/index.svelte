<script>
  import { goto } from '$app/navigation';
  import {
    Column,
    Content,
    Grid,
    Header,
    Row,
    StructuredList,
    StructuredListBody,
    StructuredListCell,
    StructuredListHead,
    StructuredListRow,
    Tag,
    Tile,
  } from 'carbon-components-svelte';
</script>

<Content style="background-color: transparent">
  <StructuredList selection ariaLabel="Plotty Pages">
    <StructuredListHead>
      <StructuredListRow head tabIndex={0}>
        <StructuredListCell head>Visualisation</StructuredListCell>
        <StructuredListCell head>Description</StructuredListCell>
        <StructuredListCell head>Status</StructuredListCell>
      </StructuredListRow>
    </StructuredListHead>
    <StructuredListBody>
      <StructuredListRow tabIndex={0} on:click={() => goto('mandelbrot')}>
        <StructuredListCell>Mandelbrot</StructuredListCell>
        <StructuredListCell>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dui magna, finibus id tortor sed, aliquet
          bibendum augue. Aenean posuere sem vel euismod dignissim. Nulla ut cursus dolor. Pellentesque vulputate nisl a
          porttitor interdum.
        </StructuredListCell>
        <StructuredListCell>
          <Tag type="blue">In progress</Tag>
        </StructuredListCell>
      </StructuredListRow>
      <!--      <StructuredListRow tabIndex={0} on:click={() => goto('butterfly')}>-->
      <!--        <StructuredListCell>Butterfly</StructuredListCell>-->
      <!--        <StructuredListCell>-->
      <!--          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dui magna, finibus id tortor sed, aliquet-->
      <!--          bibendum-->
      <!--          augue. Aenean posuere sem vel euismod dignissim. Nulla ut cursus dolor. Pellentesque vulputate nisl a-->
      <!--          porttitor-->
      <!--          interdum.-->
      <!--        </StructuredListCell>-->
      <!--        <StructuredListCell>-->
      <!--          <Tag type="green">Done</Tag>-->
      <!--        </StructuredListCell>-->
      <!--      </StructuredListRow>-->
      <StructuredListRow tabIndex={0} on:click={() => goto('bezier')}>
        <StructuredListCell>Bézier</StructuredListCell>
        <StructuredListCell>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dui magna, finibus id tortor sed, aliquet
          bibendum augue. Aenean posuere sem vel euismod dignissim. Nulla ut cursus dolor. Pellentesque vulputate nisl a
          porttitor interdum.
        </StructuredListCell>
        <StructuredListCell>
          <Tag type="blue">In progress</Tag>
        </StructuredListCell>
      </StructuredListRow>
      <StructuredListRow tabIndex={0} on:click={() => goto('formula')}>
        <StructuredListCell>Formula</StructuredListCell>
        <StructuredListCell>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dui magna, finibus id tortor sed, aliquet
          bibendum augue. Aenean posuere sem vel euismod dignissim. Nulla ut cursus dolor. Pellentesque vulputate nisl a
          porttitor interdum.
        </StructuredListCell>
        <StructuredListCell>
          <Tag type="blue">In progress</Tag>
        </StructuredListCell>
      </StructuredListRow>
    </StructuredListBody>
  </StructuredList>
</Content>
