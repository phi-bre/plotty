<script>
  import Project from '$lib/Project.svelte';
  import Header from '$lib/Header.svelte';
</script>

<svelte:head>
  <title>plotty.</title>
</svelte:head>

<Header />

<section class="content overflow-hidden rounded">
  <div class="grid md:grid-cols-3 md:grid-rows-none gap-6">
    <Project
      name="Mandelbrot"
      href="/mandelbrot"
      badge="2D"
      description="A performant mandelbrot implementation."
    />
    <Project
      name="Mandeldot"
      href="/mandeldot"
      badge="3D"
      description="A three-dimensional Mandelbrot visualization."
    />
    <Project
      name="Formula"
      href="/formula"
      badge="2D"
      description="A beautiful math equation plotter."
    />
    <Project
      name="Differential"
      href="/field"
      badge="2D"
      description="Visualizes differential equations."
    />
    <Project
      name="Bézier"
      href="/bezier"
      badge="3D"
      description="A Bézier curves plotter with animations."
    />
  </div>
</section>
