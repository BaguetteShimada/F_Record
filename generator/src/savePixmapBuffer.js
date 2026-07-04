const { DEFAULT_BACKGROUND_COLOR } = require("./savePixmapSettings");

function createInitialSavePixmapBuffer(targetWidth, targetHeight, formatType, backgroundColor) {
    const buffer = Buffer.alloc(targetWidth * targetHeight * 4);

    if (formatType === "png") {
        buffer.fill(0);
        return buffer;
    }

    const bg = backgroundColor || DEFAULT_BACKGROUND_COLOR;
    for (let i = 0; i < buffer.length; i += 4) {
        buffer[i] = bg.r;
        buffer[i + 1] = bg.g;
        buffer[i + 2] = bg.b;
        buffer[i + 3] = 255;
    }
    return buffer;
}

module.exports = {
    createInitialSavePixmapBuffer,
};
