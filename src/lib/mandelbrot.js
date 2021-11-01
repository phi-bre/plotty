import * as THREE from './three';
import { evaluate } from './algorithms';

export class Mandelbrot {
  constructor(canvas) {
    this.blub = true;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / -2,
      window.innerHeight / 2,
      Number.MIN_VALUE,
      Number.MAX_VALUE,
    );
    // this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);
    // this.camera.zoom = 1;
    const controls = new THREE.OrbitControls(this.camera, canvas);
    controls.enableRotate = false;
    controls.screenSpacePanning = true;
    // controls.mouseButtons = { LEFT: THREE.MOUSE.PAN };
    // controls.touches = { ONE: THREE.TOUCH.DOLLY_PAN };

    this.scene = new THREE.Scene();
    // this.geometry = new THREE.BufferGeometry();
    // this.material = new THREE.PointsMaterial({
    //   size: 4,
    //   color: "white",
    //   // vertexColors: true,
    //   sizeAttenuation: false,
    //   opacity: 0.1,
    //   transparent: true
    // });
    // this.mesh = new THREE.Points(this.geometry, this.material);
    // // this.mesh.scale.addScalar(100);
    // this.scene.add(this.mesh);

    // const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // const sphere = new THREE.Mesh(geometry, material);
    // this.scene.add(sphere);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        scale: {
          type: 'float',
          value: 200,
        },
        position: {
          type: 'v2',
          value: new THREE.Vector2(0, 0),
        },
        depth: {
          type: 'int',
          value: 100,
        },
        resolution: {
          type: 'v2',
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader: `
        uniform vec2 resolution;
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform int depth;
        uniform float scale;
        uniform vec2 resolution;
        uniform vec2 position;

        void main() {
          int iteration = 0;
          vec2 z = (cameraPosition.xy * vec2(1.0, -1.0) + gl_FragCoord.xy - resolution / 2.0) / scale;
          vec2 location = position;
          for (int i = 0; i < depth; i++) {
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + location;
            iteration = i;
            if (dot(z, z) > 4.0) break;
          }
          float c = 1.0 / float(depth) * float(iteration);
          
//          int i2 = 0;
//          vec2 l2 = (cameraPosition.xy * vec2(1.0, -1.0) + gl_FragCoord.xy - resolution / 2.0) / scale;
//          vec2 z2 = vec2(0.0);
//          for (int i = 0; i < depth; i++) {
//            z2 = vec2(z2.x * z2.x - z2.y * z2.y, 2.0 * z2.x * z2.y) + l2;
//            i2 = i;
//            if (dot(z2, z2) > 4.0) break;
//          }
//          float c2 = 1.0 / float(depth) * float(i2);
          
          gl_FragColor = vec4(c, c, c, 1.0);
        }
      `,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(100000, 100000), this.material);
    this.scene.add(this.mesh);

    window.addEventListener('mousemove', event => {
      const x = (event.x - window.innerWidth / 2) / window.innerWidth * 2;
      const y = (event.y - window.innerHeight / 2) / window.innerHeight * 2;
      console.log(x, y);
      this.material.uniforms.position.value = new THREE.Vector2(x, y);
      this.render();
    });

    window.addEventListener('resize', this.resize.bind(this), false);
    controls.addEventListener('change', () => {
      this.render();
      // this.update();
      // this.renderer.render(this.scene, this.camera);
    });
    // window.addEventListener('wheel', event => {
    //   console.log(this.material.uniforms.scale.value);
    //   this.material.uniforms.scale.value += event.deltaY * -0.01;
    // });
    this.resize();
    this.render();
    // this.update();
  }

  get depth() {
    return this.material.uniforms.depth.value;
  }

  set depth(value) {
    this.material.uniforms.depth.value = value;
    this.render();
  }

  set scale(value) {
    console.log(value);
    this.material.uniforms.scale.value += value;
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
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
        const ex = x + ((i - width / 2) * depth) / precision;
        const ey = y + ((j - height / 2) * depth) / precision;
        for (const point of evaluate(ex, ey, 100)) {
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
