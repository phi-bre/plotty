import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ConvexBufferGeometry, ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
camera.position.set(0, 20, 100);
controls.addEventListener('change', () => {
    renderer.render(scene, camera);
});

// const range = document.createElement('input');
// range.type = 'range';
// range.oninput = () => {
//     console.log(range.value);
//     update(range.value);
// }
// range.style.position = 'fixed';
// range.style.zIndex = '10';
// range.style.top = 0;
// range.style.left = 0;
// range.min = 0;
// range.max = 1;
// range.step = 0.00001;
// document.body.appendChild(range);

let a = 0;
let d = 0.001;
setInterval(() => {
    a += d;
    if (a >= 1 || a <= -1) d = -d;
    update(a);
}, 16);

update();

function update(a = 0) {
    scene.remove(...scene.children);
    const points = [...g(t => {
        const z = (Math.E ** Math.cos(t) - 2 * Math.cos(4 * t) - (Math.sin(5) * (t / 12)));
        return new THREE.Vector3(Math.sin(t * a) * z, Math.cos(t * a) * z, z);
    }, 0, 12 * Math.PI)];

    const line = new MeshLine();
    line.setPoints(points);
    const material = new MeshLineMaterial({ lineWidth : 0.05, color: '#3498db' });
    const mesh = new THREE.Mesh(line, material);
    scene.add(mesh);
    renderer.render(scene, camera);
}

// const curve = [
//     new THREE.Vector3(0.30959752321981426, 0.7575757575757576),
//     new THREE.Vector3(0.2777777777777778, 0.5),
//     new THREE.Vector3(0.27548209366391185, 0.1510574018126888),
//     new THREE.Vector3(0.14705882352941177, 0.2173913043478261, 1),
// ];
// const points = g(t => {
//     if (t < 0) t = 0;
//     if (t > 1) t = 1;
//     if (t === 0) return curve[0].clone();
//     if (t === 1) return curve[curve.length - 1].clone();
//     const tmp = curve.map(p => p.clone()); // deep copy
//
//     for (let i = 1; i < curve.length; i++) {
//         for (let j = 0; j < curve.length - i; j++) {
//             tmp[j].x = (1 - t) * tmp[j].x + t * tmp[j + 1].x;
//             tmp[j].y = (1 - t) * tmp[j].y + t * tmp[j + 1].y;
//             tmp[j].z = (1 - t) * tmp[j].z + t * tmp[j + 1].z;
//         }
//     }
//
//     return tmp[0];
// }, 0, 1);
// const points = g((x, y) => new THREE.Vector3(x, 0));

function g(f, min = 0, max = 1) {
    const p1 = f(min), p2 = f(max), distance = p1.distanceTo(p2);
    if (distance > 0.1 || distance < 0.00000001) {
        return [...g(f, min, (min + max) / 2), ...g(f, (min + max) / 2, max)];
    } else {
        return [p1];
    }
}

// function* generate(f, min = 0, max = 1) {
//     const p1 = f(min);
//     const p2 = f((min + max) / 2);
//     const p3 = f(max);
//     const sharpness = Math.abs(p2.clone().sub(p1).dot(p3.clone().sub(p2)));
//     console.log(p2.clone().sub(p1).dot(p3.clone().sub(p2)));
//     if (sharpness < 15) {
//         yield p1;
//         yield p2;
//         yield p3;
//     } else {
//         yield* generate(f, min, (min + max) / 2);
//         yield* generate(f, (min + max) / 2, max);
//     }
// }
//
// console.log(...generate(t => {
//     const z = (Math.E ** Math.cos(t) - 2 * Math.cos(4 * t) - (Math.sin(5) * (t / 12)));
//     return new THREE.Vector3(Math.sin(t) * z, Math.cos(t) * z, z);
// }, 0, 12 * Math.PI));

// const line = new THREE.LineSegments(
//     new THREE.WireframeGeometry(
//         new THREE.BoxGeometry(100, 100, 100, 1, 1, 1),
//     ),
//     new THREE.LineBasicMaterial({ color: 'white', opacity: 0.25, transparent: true }),
// );
// scene.add(line);

{
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // // geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(points.map((p, i) => [1, i / points.length * 2, i / points.length]).flat()), 3, false));
    // // const material = new THREE.PointsMaterial({ size: 0.01, color: 'white' });
    // const mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#3498db', /* vertexColors: THREE.VertexColors */ }));
    // mesh.scale.addScalar(50);
    // scene.add(mesh);

    // const line = new MeshLine();
    // line.setPoints(points);
    // const material = new MeshLineMaterial({ lineWidth : 0.05, color: '#3498db' });
    // const mesh = new THREE.Mesh(line, material);
    // scene.add(mesh);
}

// {
//     const geometry = new ConvexBufferGeometry(points);
//     const material = new THREE.MeshBasicMaterial({ color: 'green' });
//
//     const back = new THREE.Mesh(geometry, material);
//     back.material.side = THREE.BackSide;
//     back.scale.addScalar(50);
//     back.renderOrder = 0;
//
//     const front = new THREE.Mesh(geometry, material.clone());
//     back.material.side = THREE.FrontSide;
//     front.scale.addScalar(50);
//     front.renderOrder = 1;
//
//     scene.add(back, front);
// }
