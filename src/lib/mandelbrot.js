import * as THREE from './three';
import { batched, evaluate, mandelbrot } from "./algorithms";

export class Mandelbrot {
  constructor(canvas) {
    this.blub = true;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
    this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / -2, window.innerHeight / 2, Number.MIN_VALUE, Number.MAX_VALUE);
    // this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);
    this.camera.zoom = 200;
    const controls = new THREE.OrbitControls(this.camera, canvas);
    controls.enableRotate = true;
    controls.screenSpacePanning = true;
    // controls.mouseButtons = { LEFT: THREE.MOUSE.PAN };
    // controls.touches = { ONE: THREE.TOUCH.DOLLY_PAN };

    this.scene = new THREE.Scene();
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 4,
      color: "white",
      // vertexColors: true,
      sizeAttenuation: false,
      opacity: 0.1,
      transparent: true
    });
    this.mesh = new THREE.Points(this.geometry, this.material);
    // this.mesh.scale.addScalar(100);
    this.scene.add(this.mesh);

    window.addEventListener("resize", this.resize.bind(this), false);
    controls.addEventListener("change", () => {
      this.update();
      // this.renderer.render(this.scene, this.camera);
    });
    this.resize();
    this.update();
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
  }

  update() {
    if (!this.blub) return this.renderer.render(this.scene, this.camera);

    console.time('a');
    const depth = 1 / this.camera.zoom;
    const x = this.camera.position.x;
    const y = this.camera.position.y;
    const values = [];
    const precision = 0.25;
    const width = window.innerWidth * precision;
    const height = window.innerHeight * precision;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const ex = x + (i - width / 2) * depth / precision;
        const ey = y + (j - height / 2) * depth / precision;
        for (const point of evaluate(ex, ey, 10)) {
          values.push(new THREE.Vector3(...point));
        }
      }
    }
    this.mesh.geometry.setFromPoints(values);
    console.log(values.length / 3, width * height * 5);

    // this.geometry.push(new Float32Array(values));
    this.renderer.render(this.scene, this.camera);
    console.timeEnd('a');

    // const iterator = mandelbrot(y, x, w, h, 1);
    // const values = batched(iterator, 1_000_000);
    //
    // clearInterval(this.update.interval);
    // this.update.interval = setInterval(() => {
    //   const { done, value } = values.next();
    //   if (done) {
    //     clearInterval(this.update.interval);
    //     return this.update.interval = 0;
    //   }
    //
    //   this.geometry.push(new Float32Array(value));
    //   this.renderer.render(this.scene, this.camera);
    // }, 1);
  }
}
