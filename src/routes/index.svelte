<svelte:head>
  <title>Plotty</title>
</svelte:head>

<script>
  import * as svelte from "svelte";
  import * as THREE from "../plotty/three";
  import { mandelbrot } from "../plotty/algorithms";

  let canvas, scene, camera, renderer, controls, interval;
  let precision = 1000, depth = 10, batch = 10000;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
  camera.position.set(0, 0, 100);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);
  }

  function generate() {
    scene.remove(...scene.children);
    const iterator = mandelbrot(precision, depth);
    const material = new THREE.PointsMaterial({
      size: 0.01,
      color: "white",
      sizeAttenuation: false,
      opacity: 0.1,
      transparent: true
    });

    clearInterval(interval);
    interval = setInterval(() => {
      const geometry = new THREE.BufferGeometry();
      const points = [];

      for (let i = 0; i < batch; i++) {
        const { done, value } = iterator.next();
        if (done) {
          clearInterval(interval);
          break;
        }
        points.push(value);
      }
      geometry.setFromPoints(points);
      const mesh = new THREE.Points(geometry, material);
      mesh.scale.addScalar(100);
      scene.add(mesh);
      renderer.render(scene, camera);
    }, 1);
  }

  window.addEventListener("resize", resize, false);
  svelte.onMount(() => {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", () => {
      renderer.render(scene, camera);
    });
    resize();
    generate();
  });
</script>

<canvas bind:this={canvas} />
<div class="menu">
  <input type="range" min="1" max="100000" bind:value={batch} on:input={generate}>
  <input type="range" min="1" max="1000" bind:value={precision} on:input={generate}>
  <input type="range" min="1" max="1000" bind:value={depth} on:input={generate}>
</div>

<style>
    .menu {
        position: fixed;
        top: 10px;
        right: 10px;
    }
</style>
