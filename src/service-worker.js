
self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
    console.log('started');
    const points = [];
    for (const point of mandelbrot(event.data)) {
        points.push(point);
        if (points.length % 1.0E200) {
            event.ports[0].postMessage(points);
        }
    }
});

function map(value, from, to, min, max) {
    return (value - from) * (max - min) / (to - from) + min;
}

function* mandelbrot(width, height = width, ox = 0, oy = 0) {
    const max = 100;
    for (let i = ox; i < width; i++) {
        for (let j = oy; j < height; j++) {
            const x0 = map(i, 0, width, -2.5, 1);
            const y0 = map(j, 0, width, -1, 1);
            let x = 0, y = 0, z = 0;
            while (x * x + y * y <= 4 && z++ < max) {
                const temp = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = temp;
            }
            if (z-1 === max) yield [x, y, z / 1000];
        }
    }
}
