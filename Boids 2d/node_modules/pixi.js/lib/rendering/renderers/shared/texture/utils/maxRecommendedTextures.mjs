import { getTestContext } from '../../../gl/shader/program/getTestContext.mjs';

"use strict";
let maxRecommendedTexturesCache = null;
function maxRecommendedTextures() {
  if (maxRecommendedTexturesCache)
    return maxRecommendedTexturesCache;
  const gl = getTestContext();
  maxRecommendedTexturesCache = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  return maxRecommendedTexturesCache;
}

export { maxRecommendedTextures };
//# sourceMappingURL=maxRecommendedTextures.mjs.map
