import * as neta from '@phibre/neta';
import { Vector2 } from 'three';
import { julia } from './julia';
import { mandelbrot } from './mandelbrot';

const mouse = neta.state(new Vector2());
const depth = neta.state(100);

neta.document({
  body: [
    julia(mouse, depth),
    neta.element({
      styles: {
        position: 'fixed',
        right: 0,
        top: 0,
      },
      children: [
        mandelbrot(mouse),
        neta.element({
          tag: 'input',
          styles: {
            width: '100%',
          },
          attributes: {
            type: 'range',
            value: depth,
            min: 2,
            step: 1,
            max: 1000,
            oninput(event) {
              depth.set(event.target.value);
            },
          },
        }),
      ],
    }),
  ],
});
