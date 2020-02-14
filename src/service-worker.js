
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
        if (points.length % 100 ** 100) {
            event.ports[0].postMessage(points);
        }
    }
});

function* mandelbrot(width, height = width, ox = 0, oy = 0) {
    for (let i = ox; i < width; i++) {
        for (let j = oy; j < height; j++) {
            const x0 = (i / width * 3.5) - 1.5;
            const y0 = (j / height * 2.0) - 1.0;
            let x = 0, y = 0, iteration = 0;
            while (x * x + y * y <= 2 * 2 && iteration++ < 100000) {
                const temp = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = temp;
            }
            yield [x, y];
        }
    }
}
