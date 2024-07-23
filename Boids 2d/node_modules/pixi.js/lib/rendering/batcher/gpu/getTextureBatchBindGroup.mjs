import { BindGroup } from '../../renderers/gpu/shader/BindGroup.mjs';
import { Texture } from '../../renderers/shared/texture/Texture.mjs';
import { maxRecommendedTextures } from '../../renderers/shared/texture/utils/maxRecommendedTextures.mjs';

"use strict";
const cachedGroups = {};
function getTextureBatchBindGroup(textures, size) {
  let uid = 0;
  for (let i = 0; i < size; i++) {
    uid = uid * 31 + textures[i].uid >>> 0;
  }
  return cachedGroups[uid] || generateTextureBatchBindGroup(textures, uid);
}
let maxTextures = 0;
function generateTextureBatchBindGroup(textures, key) {
  const bindGroupResources = {};
  let bindIndex = 0;
  if (!maxTextures)
    maxTextures = maxRecommendedTextures();
  for (let i = 0; i < maxTextures; i++) {
    const texture = i < textures.length ? textures[i] : Texture.EMPTY.source;
    bindGroupResources[bindIndex++] = texture.source;
    bindGroupResources[bindIndex++] = texture.style;
  }
  const bindGroup = new BindGroup(bindGroupResources);
  cachedGroups[key] = bindGroup;
  return bindGroup;
}

export { getTextureBatchBindGroup };
//# sourceMappingURL=getTextureBatchBindGroup.mjs.map
