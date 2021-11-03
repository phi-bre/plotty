import * as neta from '@phibre/neta';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function julia(mouse, depth) {
  return neta
    .element({
      tag: 'canvas',
      styles: {
        width: '100vw',
        height: '100vh',
        display: 'block',
      },
    })
    .then((canvas) => {
      const size = 4;
      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
      const camera = new THREE.OrthographicCamera(
        window.innerWidth / -size,
        window.innerWidth / +size,
        window.innerHeight / -size,
        window.innerHeight / +size,
        Number.MIN_VALUE,
        Number.MAX_VALUE
      );
      camera.lookAt(0, 0, 0);
      camera.zoom = 100;
      const controls = new OrbitControls(camera, canvas);
      controls.enableRotate = false;
      controls.screenSpacePanning = true;

      const scene = new THREE.Scene();

      const juliaMaterial = new THREE.ShaderMaterial({
        uniforms: {
          depth: depth,
          scale: { value: 1 },
          c: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: `
          varying vec3 pos;
  
          void main() {
            pos = position;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform int depth;
          uniform float scale;
          uniform vec2 c;
          varying vec3 pos;
  
          void main() {
            int iteration = 0;
            vec2 z = pos.xy;
            for (int i = 0; i < depth; i++) {
              z = -vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
              // Following looks way cooler for some reason:
              // z = vec2(2.0 * z.x * z.y, z.x * z.x - z.y * z.y) + c;
              // z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
              iteration = i;
              if (dot(z, z) > 4.0) break;
            }
            gl_FragColor = vec4(1.0 / float(depth) * float(iteration));
          }
        `,
      });
      const juliaGeometry = new THREE.PlaneGeometry(size, size);
      const juliaMesh = new THREE.Mesh(juliaGeometry, juliaMaterial);
      juliaMesh.rotateY(Math.PI);
      scene.add(juliaMesh);

      // const grid = new THREE.GridHelper(size, size * 4, 0x121212, 0x080808);
      // grid.rotateX(Math.PI / 2);
      // scene.add(grid);

      const resize = () => {
        juliaMaterial.uniforms.scale.value = camera.zoom;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
      };

      mouse.then((vector) => {
        juliaMaterial.uniforms.c.value = vector;
        renderer.render(scene, camera);
      });

      depth.then((depth) => {
        juliaMaterial.uniforms.depth.value = depth;
        renderer.render(scene, camera);
      });

      window.addEventListener('resize', resize, false);
      controls.addEventListener('change', resize);
      resize();

      return canvas;
    });
}
