const density = 1000;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new THREE.OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.set(0, 20, 100);
controls.update();

animate();
init();

function init() {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: 'white',
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    navigator.serviceWorker
        .register('src/service-worker.js')
        .then(registration => {
            if (registration.active) {
                const channel = new MessageChannel();
                channel.port1.onmessage = event => {
                    const points = event.data.map(point => new THREE.Vector3(...point));
                    geometry.setFromPoints(points);
                    geometry.setDrawRange(0, points.length);
                };
                registration.active.postMessage(density, [channel.port2]);
            }
        });

    renderer.domElement.addEventListener('wheel', e => {
        material.size = controls.target.distanceTo(controls.object.position) / 500;
    }, false);
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
