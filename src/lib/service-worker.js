self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  let points = [];
  setInterval(() => {
    event.ports[0].postMessage(points);
    points.length = 0;
  }, 1000);
  for (const point of mandelbrot(event.data)) {
    points.push(point);
  }
});
