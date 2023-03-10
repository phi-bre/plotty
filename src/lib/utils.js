import { BufferAttribute, BufferGeometry, MeshNormalMaterial } from 'three';

export class IndexedBufferGeometry extends BufferGeometry {
  constructor(resolution = 0) {
    super();
    this.indexes = new Uint32Array(resolution);
    this.length = resolution;
  }

  set length(value) {
    if (this.indexes.length < value) {
      const temp = new Uint32Array(value);
      temp.set(this.indexes);
      this.setAttribute('position', new BufferAttribute(temp, 1));
      this.indexes = temp;
      this.setDrawRange(0, value);
    } else if (this.indexes.length > value) {
      this.setDrawRange(0, value);
    }
  }
}

export class GraphShaderMaterial extends MeshNormalMaterial {
  onBeforeCompile() {}
}
