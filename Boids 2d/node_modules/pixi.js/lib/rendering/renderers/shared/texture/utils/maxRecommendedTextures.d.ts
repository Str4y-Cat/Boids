/**
 * Returns the maximum recommended texture units to use. This uses WebGL1's `MAX_TEXTURE_IMAGE_UNITS`.
 * The response for this is that to get this info via WebGPU, we would need to make a context, which
 * would make this function async, and we want to avoid that.
 * @private
 * @returns {number} The maximum recommended texture units to use.
 */
export declare function maxRecommendedTextures(): number;
