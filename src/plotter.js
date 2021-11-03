import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function plotter({ canvas, size, vertex, fragment, uniforms }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const camera = new THREE.OrthographicCamera(
    canvas.width / -size,
    canvas.width / +size,
    canvas.height / -size,
    canvas.height / +size,
    Number.MIN_VALUE,
    Number.MAX_VALUE
  );
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.enableRotate = false;
  controls.screenSpacePanning = true;

  const scene = new THREE.Scene();
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
  });
  const geometry = new THREE.PlaneGeometry(size, size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotateY(Math.PI);
  scene.add(mesh);

  // const grid = new THREE.GridHelper(size, size * 4, 0x121212, 0x080808);
  // grid.rotateX(Math.PI / 2);
  // scene.add(grid);

  controls.addEventListener('change', () => {
    renderer.render(scene, camera);
  });

  const resize = () => {
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
    renderer.render(scene, camera);
  };
  window.addEventListener('resize', resize);
  resize();

  return { renderer, camera, controls, scene, material, geometry, mesh };
}
