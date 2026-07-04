const { DEFAULT_BACKGROUND_COLOR } = require("./savePixmapSettings");

function writeArgbPixelToRgbaBuffer(buffer, targetOffset, pixels, srcOffset, formatType, backgroundColor) {
    const alpha = pixels[srcOffset];

    if (formatType !== "png" && alpha === 0) {
        return;
    }

    buffer[targetOffset] = pixels[srcOffset + 1];
    buffer[targetOffset + 1] = pixels[srcOffset + 2];
    buffer[targetOffset + 2] = pixels[srcOffset + 3];
    buffer[targetOffset + 3] = alpha;

    if (formatType !== "png" && alpha < 255 && alpha > 0) {
        const alphaFactor = alpha / 255;
        const bg = backgroundColor || DEFAULT_BACKGROUND_COLOR;

        buffer[targetOffset] = Math.round(buffer[targetOffset] * alphaFactor + bg.r * (1 - alphaFactor));
        buffer[targetOffset + 1] = Math.round(buffer[targetOffset + 1] * alphaFactor + bg.g * (1 - alphaFactor));
        buffer[targetOffset + 2] = Math.round(buffer[targetOffset + 2] * alphaFactor + bg.b * (1 - alphaFactor));
        buffer[targetOffset + 3] = 255;
    }
}

module.exports = {
    writeArgbPixelToRgbaBuffer,
};
