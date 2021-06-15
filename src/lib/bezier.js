import * as THREE from '../lib/three';

const colors = [
  '#f1c40f',
  '#8e44ad',
  '#27ae60',
  '#e67e22',
  '#34495e',
  '#d35400',
  '#2980b9',
  '#2ecc71',
  '#2c3e50',
  '#c0392b',
  '#16a085',
  '#9b59b6',
  '#f39c12',
  '#3498db',
  '#95a5a6',
  '#1abc9c',
  '#e74c3c',
  '#7f8c8d',
];

function triangulate(curve, t) {
  const points = curve.map((p) => p.clone());
  const sliders = [];
  for (let i = 1; i < curve.length; i++) {
    const slider = [];
    for (let j = 0; j < curve.length - i; j++) {
      points[j].x = (1 - t) * points[j].x + t * points[j + 1].x;
      points[j].y = (1 - t) * points[j].y + t * points[j + 1].y;
      points[j].z = (1 - t) * points[j].z + t * points[j + 1].z;
      slider.push(points[j].clone());
    }
    sliders.push(slider);
  }
  points[0].sliders = sliders;
  return points[0];
}

function bezier(curve, precision) {
  const points = [];
  for (let i = 0; i <= precision; i++) {
    points.push(triangulate(curve, i / precision));
  }
  return points;
}

export class Bezier {
  parameter = 0;
  bezier = [
    new THREE.Vector3(0.30959752321981426, 0.7575757575757576),
    new THREE.Vector3(0.2777777777777778, 0.5),
    new THREE.Vector3(1.27548209366391185, 0.1510574018126888),
    new THREE.Vector3(0.14705882352941177, 0.2173913043478261, 1),
  ];

  constructor(canvas) {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
    this.camera.position.set(1.0411534907119235, 0.6965274187556713, 1.0122094541157602);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.controls.addEventListener('change', () => {
      this.render();
    });
    window.addEventListener('resize', () => {
      this.resize();
    });

    this.resize();
    this.update();
  }

  update() {
    this.scene.remove(...this.scene.children);

    const curveGeometry = new THREE.MeshLine();
    curveGeometry.setPoints(bezier(this.bezier, 100));
    const curveMaterial = new THREE.MeshLineMaterial({ lineWidth: 0.01, color: '#3498db' });
    const curve = new THREE.Mesh(curveGeometry, curveMaterial);

    const controls = this.bezier.map((point) => {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial({ color: '#8b8b8b' }));
      sphere.position.copy(point);
      return sphere;
    });

    const outlineGeometry = new THREE.MeshLine();
    outlineGeometry.setPoints(this.bezier);
    const outlineMaterial = new THREE.MeshLineMaterial({
      lineWidth: 0.01,
      color: '#8b8b8b',
      depthTest: false,
      transparent: true,
      opacity: 0.5,
    });
    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);

    const triangulated = triangulate(this.bezier, this.parameter);
    const sliders = triangulated.sliders.map((slider, i) => {
      const color = colors[i % colors.length];
      const sliderGeometry = new THREE.MeshLine();
      sliderGeometry.setPoints(slider);
      const sliderMaterial = new THREE.MeshLineMaterial({
        color,
        lineWidth: 0.005,
        depthTest: false,
        transparent: true,
        opacity: 0.5,
      });
      const sliderMesh = new THREE.Mesh(sliderGeometry, sliderMaterial);

      for (const point of slider) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.005), new THREE.MeshBasicMaterial({ color }));
        sphere.position.copy(point);
        sliderMesh.add(sphere);
      }

      return sliderMesh;
    });
    const parameter = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial({ color: 'red' }));
    parameter.position.copy(triangulated);

    this.scene.add(curve, outline, parameter, ...sliders, ...controls);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
  }
}
