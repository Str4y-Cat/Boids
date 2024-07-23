'use strict';

var getTestContext = require('../../../gl/shader/program/getTestContext.js');

"use strict";
let maxRecommendedTexturesCache = null;
function maxRecommendedTextures() {
  if (maxRecommendedTexturesCache)
    return maxRecommendedTexturesCache;
  const gl = getTestContext.getTestContext();
  maxRecommendedTexturesCache = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  return maxRecommendedTexturesCache;
}

exports.maxRecommendedTextures = maxRecommendedTextures;
//# sourceMappingURL=maxRecommendedTextures.js.map
