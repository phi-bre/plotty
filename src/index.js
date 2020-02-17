const density = 100;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0000001, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.set(0, 20, 100);
controls.update();

animate();
init();

function init() {
    let total = 0;
    let zoom = 1;
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: 'white',
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    register((channel, registration) => {
        channel.port1.onmessage = event => {
            const points = event.data.map(point => new THREE.Vector3(...point));
            const buffer = new THREE.BufferGeometry().setFromPoints(points);
            geometry.merge(buffer, total);
            total += event.data.length;
            console.log(total, event.data.length);
            // geometry.setDrawRange(0, total);
        };
        registration.active.postMessage(density, [channel.port2]);
    });

    renderer.domElement.addEventListener('wheel', e => {
        // material.size = controls.target.distanceTo(controls.object.position) / 500;
        zoom += e.deltaY / 100;
        points.scale.set(zoom, zoom, zoom);
    }, false);
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

async function register(callback) {
    const registration = await navigator.serviceWorker.register('src/service-worker.js');
    if (registration.active) {
        const channel = new MessageChannel();
        callback(channel, registration);
    }
}
