const assert = require("assert");
const { writeArgbPixelToRgbaBuffer } = require("../src/savePixmapPixel");

let buffer = Buffer.from([0, 0, 0, 0]);
writeArgbPixelToRgbaBuffer(buffer, 0, Buffer.from([128, 10, 20, 30]), 0, "png", null);
assert.deepStrictEqual(Array.from(buffer), [10, 20, 30, 128]);

buffer = Buffer.from([1, 2, 3, 255]);
writeArgbPixelToRgbaBuffer(buffer, 0, Buffer.from([0, 10, 20, 30]), 0, "jpg", { r: 100, g: 100, b: 100 });
assert.deepStrictEqual(Array.from(buffer), [1, 2, 3, 255]);

buffer = Buffer.from([0, 0, 0, 0]);
writeArgbPixelToRgbaBuffer(buffer, 0, Buffer.from([255, 10, 20, 30]), 0, "jpg", { r: 100, g: 100, b: 100 });
assert.deepStrictEqual(Array.from(buffer), [10, 20, 30, 255]);

buffer = Buffer.from([0, 0, 0, 0]);
writeArgbPixelToRgbaBuffer(buffer, 0, Buffer.from([128, 200, 100, 50]), 0, "jpg", { r: 100, g: 200, b: 250 });
assert.deepStrictEqual(Array.from(buffer), [150, 150, 150, 255]);

buffer = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);
writeArgbPixelToRgbaBuffer(buffer, 4, Buffer.from([255, 1, 2, 3, 255, 4, 5, 6]), 4, "png", null);
assert.deepStrictEqual(Array.from(buffer), [0, 0, 0, 0, 4, 5, 6, 255]);
