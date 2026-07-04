const assert = require("assert");
const { copyPixmapPixelsToRgbaBuffer } = require("../src/savePixmapCopy");

function readPixel(buffer, width, x, y) {
    const offset = (y * width + x) * 4;
    return Array.from(buffer.slice(offset, offset + 4));
}

const pixmap = {
    width: 3,
    height: 2,
    bytesPerPixel: 4,
    rowBytes: 12,
    pixels: Buffer.from([
        255, 10, 20, 30,
        255, 40, 50, 60,
        255, 70, 80, 90,
        255, 100, 110, 120,
        255, 130, 140, 150,
        255, 160, 170, 180,
    ]),
};
const targetWidth = 4;
const targetHeight = 3;
const buffer = Buffer.alloc(targetWidth * targetHeight * 4);

copyPixmapPixelsToRgbaBuffer({
    backgroundColor: null,
    buffer,
    extract: { x: 1, y: 0, width: 2, height: 2 },
    formatType: "png",
    padding: { left: 1, top: 1 },
    pixmap,
    targetHeight,
    targetWidth,
});

assert.deepStrictEqual(readPixel(buffer, targetWidth, 0, 0), [0, 0, 0, 0]);
assert.deepStrictEqual(readPixel(buffer, targetWidth, 1, 1), [40, 50, 60, 255]);
assert.deepStrictEqual(readPixel(buffer, targetWidth, 2, 1), [70, 80, 90, 255]);
assert.deepStrictEqual(readPixel(buffer, targetWidth, 1, 2), [130, 140, 150, 255]);
assert.deepStrictEqual(readPixel(buffer, targetWidth, 2, 2), [160, 170, 180, 255]);
assert.deepStrictEqual(readPixel(buffer, targetWidth, 3, 2), [0, 0, 0, 0]);

const skippedBuffer = Buffer.from([1, 2, 3, 4]);
copyPixmapPixelsToRgbaBuffer({
    backgroundColor: null,
    buffer: skippedBuffer,
    extract: { x: 5, y: 0, width: 2, height: 1 },
    formatType: "png",
    padding: { left: 0, top: 0 },
    pixmap,
    targetHeight: 1,
    targetWidth: 1,
});
assert.deepStrictEqual(Array.from(skippedBuffer), [1, 2, 3, 4]);
