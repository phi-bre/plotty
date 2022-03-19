export function scene(descriptor) {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext('webgl');
  const ext = gl.getExtension('ANGLE_instanced_arrays');

  if (!gl || !ext) {
    throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');
  }

  return {
    create() {
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)
        || !gl.getShaderParameter(this.vertex, gl.COMPILE_STATUS)
        || !gl.getShaderParameter(this.fragment, gl.COMPILE_STATUS)) {

        const info = gl.getProgramInfoLog(this.program)
          + gl.getShaderInfoLog(this.vertex)
          + gl.getShaderInfoLog(this.fragment);

        gl.deleteShader(this.vertex);
        gl.deleteShader(this.fragment);
        gl.deleteProgram(this.program);

        throw new Error(info);
      }

      return canvas;
    },
    link(mesh) {

    },
    draw(program) {
      gl.useProgram(program);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    destroy() {
      // gl.deleteShader(this.vertex);
      // gl.deleteShader(this.fragment);
      // gl.deleteProgram(this.program);
    },
  };
}

export function mesh() {
  return {
    extend({}) {

    },
    create(gl) {
      this.vertex = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(this.vertex, vertex);
      gl.compileShader(this.vertex);

      this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(this.fragment, fragment);
      gl.compileShader(this.fragment);

      this.program = gl.createProgram();
      gl.attachShader(this.program, this.vertex);
      gl.attachShader(this.program, this.fragment);
      gl.linkProgram(this.program);
    },
    destroy() {

    },
  };
}
