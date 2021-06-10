function map(value, from, to, min, max) {
  return ((value - from) * (max - min)) / (to - from) + min;
}

export function* mandelbrot(fx, fy, tx, ty, precision = 1, depth = 100) {
  for (let x = fx; x < tx; x += precision) {
    for (let y = fy; y < ty; y += precision) {
      let zr = 0, zi = 0, i = 0;
      while (zr * zr + zi * zi <= 4 && i++ < depth) {
        const z = zr * zr - zi * zi + x;
        zi = 2 * zr * zi + y;
        zr = z;
        if (i > 2) {
          yield [y, x, z];
        }
      }
    }
  }
}

export function* evaluate(x, y, depth) {
  let zr = 0, zi = 0, i = 0;
  while (zr * zr + zi * zi <= 4 && i++ < depth) {
    const z = zr * zr - zi * zi + x;
    zi = 2 * zr * zi + y;
    zr = z;
    if (i > 2) {
      yield [x, y, z];
    }
  }
}

export function* batched(iterator, batch) {
  let index = 0, values = [];
  for (const value of iterator) {
    if (index > batch) {
      yield values;
      values = [];
      index = 0;
    }
    values.push(...value);
    index++;
  }
  if (values.length) {
    yield values;
  }
}
