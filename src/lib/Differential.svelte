<script>
  import { Line, useThrelte } from '@threlte/core';
  import {
    BufferAttribute,
    BufferGeometry,
    ShaderMaterial,
    Vector2,
    Vector3,
    Vector4,
  } from 'three';

  export let formula = '(x * x - 2.0) / (y * y + 1.0) * sin(x - 2.0) + sin(y)';
  export let point = new Vector2(0, 0);

  const { size } = useThrelte();
  $: points = new Array(resolution).fill(0).map((_, i) => {
    return new Vector3(i - resolution / 2, 0);
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(points, 1));

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
        int index = int(position.x);
        int direction = (index < resolution.x / 2.0) ? 1 : -1;
        float step = -0.1 * float(direction);

        vec2 local = point;

        for (int i = 0; i < resolution.x / 2.0; i++) {
          local += vec2(step, step * formula(local.x, local.y));

          if (!(i < (resolution.x / 2.0 - index) * direction)) {
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
