export * from 'three';
export * from 'three/examples/jsm/controls/OrbitControls.js';
// import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';
// export { MeshLine, MeshLineMaterial, MeshLineRaycast };

import * as THREE from 'three';

export class CircularBufferGeometry extends THREE.BufferGeometry {
  constructor(size) {
    super();
    this.position_offset = 0;
    this.size = size;
    this.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.size * 3), 3));

  }

  push(vertices) {
    const overlap = (this.position_offset + vertices.length) % (this.size * 3);
    if (this.position_offset + vertices.length < this.size * 3) {
      this.attributes.position.array.set(vertices, this.position_offset);
    } else {
      this.attributes.position.array.set(vertices.subarray(0, overlap), this.attributes.position.array);
      this.attributes.position.array.set(vertices.subarray(overlap), overlap);
    }
    this.position_offset = overlap;
    this.attributes.position.needsUpdate = true;
    if (this.drawRange.count + vertices.length < this.size) {
      this.setDrawRange(0, this.drawRange.count + vertices.length);
    }
  }
}
