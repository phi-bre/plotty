<svelte:head>
  <title>Plotty - Butterfly</title>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { browser } from '$app/env';

  let canvas, resize, generate, interval, THREE;
  let scene, camera, renderer, controls;
  let a = 1, f = 0, t = 12 * Math.PI;


  function g(f, min = 0, max = 1) {
    const p1 = f(min),
      p2 = f(max),
      distance = p1.distanceTo(p2);
    if (distance > 0.1 || distance < 0.00000001) {
      return [...g(f, min, (min + max) / 2), ...g(f, (min + max) / 2, max)];
    } else {
      return [p1];
    }
  }

  if (browser) {
    onMount(async () => {
      THREE = await import('../lib/three');

      resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.render(scene, camera);
      }

      generate = () => {
        scene.remove(...scene.children);
        const points = [...g(t => {
            const z = (Math.E ** Math.cos(t) - 2 * Math.cos(4 * t) - (Math.sin(5) * (t / 12)));
            return new THREE.Vector3(Math.sin(t * a) * z, Math.cos(t * a) * z, z);
        }, f, t)];

        const line = new THREE.MeshLine();
        line.setPoints(points);
        const material = new THREE.MeshLineMaterial({ lineWidth : 0.05, color: '#3498db' });
        const mesh = new THREE.Mesh(line, material);
        scene.add(mesh);
        renderer.render(scene, camera);
      }

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
      camera.position.set(0, 0, 100);
      renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      window.addEventListener("resize", resize, false);
      controls.addEventListener("change", () => {
        renderer.render(scene, camera);
      });
      resize();
      generate();
    });
  }
</script>

<canvas bind:this={canvas} />
<div class="menu">
  <input type="range" min="-1" max="1" step="0.001" bind:value={a} on:input={generate}>
  <input type="range" min="1" max="100" bind:value={f} on:input={generate}>
  <input type="range" min="1" max="100" bind:value={t} on:input={generate}>
</div>

<style>
    .menu {
        position: fixed;
        top: 10px;
        right: 10px;
    }
</style>
