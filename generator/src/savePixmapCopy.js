const { writeArgbPixelToRgbaBuffer } = require("./savePixmapPixel");

function copyPixmapPixelsToRgbaBuffer(options) {
    const {
        backgroundColor,
        buffer,
        extract,
        formatType,
        padding,
        pixmap,
        targetHeight,
        targetWidth,
    } = options;
    const { width, height, pixels, bytesPerPixel, rowBytes } = pixmap;

    for (let y = 0; y < extract.height; y++) {
        const targetY = y + padding.top;
        if (targetY < 0 || targetY >= targetHeight) {
            continue;
        }

        const srcY = extract.y + y;
        if (srcY < 0 || srcY >= height) {
            continue;
        }

        const srcRowOffset = srcY * (rowBytes || (width * bytesPerPixel));
        const targetRowStart = (targetY * targetWidth + padding.left) * 4;
        const copyWidth = Math.min(extract.width, width - extract.x);
        if (copyWidth <= 0) {
            continue;
        }

        for (let x = 0; x < copyWidth; x++) {
            const srcOffset = srcRowOffset + (extract.x + x) * bytesPerPixel;
            const targetOffset = targetRowStart + x * 4;
            writeArgbPixelToRgbaBuffer(buffer, targetOffset, pixels, srcOffset, formatType, backgroundColor);
        }
    }
}

module.exports = {
    copyPixmapPixelsToRgbaBuffer,
};
