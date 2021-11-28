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
  controlObjects = [];
  mouse = new THREE.Vector2();
  parameter = 0.5;
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
    this.raycaster = new THREE.Raycaster();

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => {
      this.render();
    });

    this.transform = new THREE.TransformControls(this.camera, canvas);
    this.transform.addEventListener('objectChange', () => {
      this.transform.object.point.copy(this.transform.object.position);
      this.update();
    });
    this.scene.add(this.transform);

    window.addEventListener('resize', () => {
      this.resize();
    });
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.move();
    });
    window.addEventListener('click', (event) => {
      this.click();
    });

    this.resize();
    this.create();
    this.update();
  }

  create() {
    // BEZIER CURVE
    if (this.curveObject) this.scene.remove(this.curveObject);
    const curveGeometry = new THREE.LineGeometry();
    const curveMaterial = new THREE.LineMaterial({
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      linewidth: 4,
      color: '#3498db',
    });
    this.curveObject = new THREE.LineSegments2(curveGeometry, curveMaterial);
    this.scene.add(this.curveObject);

    // CONTROL POINTS
    if (this.controlObjects) this.scene.remove(...this.controlObjects);
    this.controlObjects = this.bezier.map((point) => {
      const sphereGeometry = new THREE.SphereGeometry(0.01);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.point = point;
      return sphere;
    });
    this.scene.add(...this.controlObjects);

    // OUTLINE
    if (this.outlineObject) this.scene.remove(this.outlineObject);
    const outlineGeometry = new THREE.LineGeometry();
    const outlineMaterial = new THREE.LineMaterial({
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      linewidth: 3,
      color: 0x8b8b8b,
      transparent: true,
      opacity: 0.5,
    });
    this.outlineObject = new THREE.LineSegments2(outlineGeometry, outlineMaterial);
    this.scene.add(this.outlineObject);

    // SLIDERS
    if (this.sliderObjects) this.scene.remove(...this.sliderObjects);
    this.sliderObjects = this.bezier.map((point, i) => {
      const color = colors[i % colors.length];
      const sliderGeometry = new THREE.LineGeometry();
      const sliderMaterial = new THREE.LineMaterial({
        color,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        linewidth: 3,
        transparent: true,
        opacity: 0.5,
      });
      const sliderMesh = new THREE.LineSegments2(sliderGeometry, sliderMaterial);
      // slider.forEach(point => {
      //   const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.005), new THREE.MeshBasicMaterial({ color }));
      //   sphere.position.copy(point);
      //   sliderMesh.add(sphere);
      // });
      return sliderMesh;
    });
    this.scene.add(...this.sliderObjects);

    // PARAMETER POINT
    if (this.parameterObject) this.scene.remove(this.parameterObject);
    const parameterGeometry = new THREE.SphereGeometry(0.01);
    const parameterMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
    this.parameterObject = new THREE.Mesh(parameterGeometry, parameterMaterial);
    this.scene.add(this.parameterObject);
  }

  update() {
    const triangulated = triangulate(this.bezier, this.parameter);

    this.curveObject.geometry.fromLine({
      geometry: new THREE.BufferGeometry().setFromPoints(bezier(this.bezier, 100)),
    });

    this.controlObjects.forEach((point, i) => {
      point.position.copy(this.bezier[i]);
    });

    this.outlineObject.geometry.fromLine({
      geometry: new THREE.BufferGeometry().setFromPoints(this.bezier),
    });

    this.sliderObjects.forEach((slider, i) => {
      if (!triangulated.sliders[i]) return;
      slider.geometry.fromLine({
        geometry: new THREE.BufferGeometry().setFromPoints(triangulated.sliders[i]),
      });
    });

    this.parameterObject.position.copy(triangulated);

    this.render();
  }

  click() {
    const [point] = this.raycaster.intersectObjects(this.controlObjects);
    if (point) {
      this.transform.attach(point.object);
      this.controls.enabled = false;
    } else if (this.transform.object) {
      this.transform.detach();
      this.controls.enabled = true;
    } else {
      // TODO: Fix issue while dragging
      // this.bezier.push(new THREE.Vector3(this.mouse.x, this.mouse.y));
      // this.create();
      // this.update();
    }
    this.render();
  }

  move() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.movingPoint?.object.material.color.set(0xffffff);
    this.movingPoint = this.raycaster.intersectObjects(this.controlObjects)[0];
    this.movingPoint?.object.material.color.set(0xff0000);
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
