<script>
  import { Line, useThrelte } from '@threlte/core';
  import { ShaderMaterial, Vector2, Vector4 } from 'three';

  export let formula = '(x * x - 2.0) / (y * y + 1.0) * sin(x - 2.0) + sin(y)';
  export let precision = 100;
  export let point = new Vector2(0, 0);

  const { size } = useThrelte();
  const points = [];

  $: {
    points.length = 0;
    for (let i = 0; i < precision; i++) {
      points.push([i - precision / 2, 0]);
    }
  }

  $: material = new ShaderMaterial({
    uniforms: {
      point: { value: new Vector2(point.x, point.y) },
      resolution: { value: new Vector2() },
      color: { value: new Vector4(1, 0, 0, 1) },
    },
    vertexShader: `
      uniform vec2 point;
      uniform vec2 resolution;

      float formula(float x, float y) {
        return ${formula};
      }

      void main() {
        vec2 local = point;

        // float aspect = resolution.y / resolution.x;
        // vec2 viewport = vec2(aspect, 1) * zoom;
        // vec2 position = target * vec2(1, -1) / viewport / (resolution / 2.0);
        // int direction = (int(position.x) < ${precision} / 2) ? 1 : -1;
        // float step = (2.0 / viewport.x / ${precision}.0) * 2.0 * float(direction);

        int index = int(position.x);
        int direction = (index < ${precision} / 2) ? 1 : -1;
        float step = -0.1 * float(direction);

        for (int i = 0; i < ${precision} / 2; i++) {
          local += vec2(step, step * formula(local.x, local.y));

          if (!(i < (${precision} / 2 - index) * direction)) {
            break;
          }
        }

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(local, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec4 color;

      void main() {
        gl_FragColor = vec4(0.365, 0.678, 1, 0);
      }
    `,
  });

  $: material.uniforms.resolution.value = new Vector2($size.width, $size.height);
  $: material.uniforms.point.value = new Vector2(point.x, point.y);
</script>

<Line {points} {material} />
