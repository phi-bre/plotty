function map(value, from, to, min, max) {
  return ((value - from) * (max - min)) / (to - from) + min;
}

export function* mandelbrot(precision = 100, depth = 100) {
  for (let ix = 0; ix < precision; ix++) {
    for (let iy = 0; iy < precision / 2; iy++) {
      const x = map(ix, 0, precision, -2.5, 1);
      const y = map(iy, 0, precision / 2, 0, 2);
      let zr = 0,
        zi = 0,
        i = 0;
      while (zr * zr + zi * zi <= 4 && i++ < depth) {
        const z = zr * zr - zi * zi + x;
        zi = 2 * zr * zi + y;
        zr = z;
        if (i > 2) {
          // Only include points that are part of the set
          yield [x, +y, z];
          yield [x, -y, z];
        }
      }
    }
  }
}
