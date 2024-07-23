"use strict";
class BatchableMesh {
  constructor() {
    this.batcher = null;
    this.batch = null;
    this.roundPixels = 0;
    this._uvUpdateId = -1;
    this._textureMatrixUpdateId = -1;
  }
  get blendMode() {
    return this.mesh.groupBlendMode;
  }
  reset() {
    this.mesh = null;
    this.texture = null;
    this.batcher = null;
    this.batch = null;
  }
  packIndex(indexBuffer, index, indicesOffset) {
    const indices = this.geometry.indices;
    for (let i = 0; i < indices.length; i++) {
      indexBuffer[index++] = indices[i] + indicesOffset;
    }
  }
  packAttributes(float32View, uint32View, index, textureId) {
    const mesh = this.mesh;
    const geometry = this.geometry;
    const wt = mesh.groupTransform;
    const textureIdAndRound = textureId << 16 | this.roundPixels & 65535;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const positions = geometry.positions;
    const uvBuffer = geometry.getBuffer("aUV");
    const uvs = uvBuffer.data;
    let transformedUvs = uvs;
    const textureMatrix = this.texture.textureMatrix;
    if (!textureMatrix.isSimple) {
      transformedUvs = this._transformedUvs;
      if (this._textureMatrixUpdateId !== textureMatrix._updateID || this._uvUpdateId !== uvBuffer._updateID) {
        if (!transformedUvs || transformedUvs.length < uvs.length) {
          transformedUvs = this._transformedUvs = new Float32Array(uvs.length);
        }
        this._textureMatrixUpdateId = textureMatrix._updateID;
        this._uvUpdateId = uvBuffer._updateID;
        textureMatrix.multiplyUvs(uvs, transformedUvs);
      }
    }
    const abgr = mesh.groupColorAlpha;
    for (let i = 0; i < positions.length; i += 2) {
      const x = positions[i];
      const y = positions[i + 1];
      float32View[index] = a * x + c * y + tx;
      float32View[index + 1] = b * x + d * y + ty;
      float32View[index + 2] = transformedUvs[i];
      float32View[index + 3] = transformedUvs[i + 1];
      uint32View[index + 4] = abgr;
      uint32View[index + 5] = textureIdAndRound;
      index += 6;
    }
  }
  get vertexSize() {
    return this.geometry.positions.length / 2;
  }
  get indexSize() {
    return this.geometry.indices.length;
  }
}

export { BatchableMesh };
//# sourceMappingURL=BatchableMesh.mjs.map
