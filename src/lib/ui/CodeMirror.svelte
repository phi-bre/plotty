<script>
  import { Compartment } from '@codemirror/state';
  import { python } from '@codemirror/lang-python';
  import { onMount, onDestroy } from 'svelte';
  import { basicSetup } from 'codemirror';
  import { EditorView, placeholder as holder } from '@codemirror/view';
  import { keymap } from '@codemirror/view';
  import { indentWithTab } from '@codemirror/commands';
  import { dark } from '$lib/codemirror';

  export let value;
  export let placeholder = '';
  export let extensions = [basicSetup, keymap.of([indentWithTab]), python(), dark];
  export let wrap = true;

  let div;
  let view;
  let wrapping = new Compartment();

  onMount(() => {
    view = new EditorView({
      parent: div,
      doc: value,
      extensions: [
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            value = update.state.doc.toString();
          }
        }),
        holder(placeholder),
        wrapping.of(wrap ? EditorView.lineWrapping : []),
        ...extensions,
      ],
    });
  });

  onDestroy(() => {
    if (view) {
      view.destroy();
    }
  });

  $: if (view) {
    view.dispatch({
      effects: wrapping.reconfigure(wrap ? EditorView.lineWrapping : []),
    });
  }
</script>

<div class={$$props.class} bind:this={div} />
