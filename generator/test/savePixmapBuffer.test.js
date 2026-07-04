const assert = require("assert");
const { createInitialSavePixmapBuffer } = require("../src/savePixmapBuffer");

assert.deepStrictEqual(
    Array.from(createInitialSavePixmapBuffer(2, 1, "png", { r: 1, g: 2, b: 3 })),
    [0, 0, 0, 0, 0, 0, 0, 0],
);

assert.deepStrictEqual(
    Array.from(createInitialSavePixmapBuffer(2, 1, "jpg", { r: 10, g: 20, b: 30 })),
    [10, 20, 30, 255, 10, 20, 30, 255],
);

assert.deepStrictEqual(
    Array.from(createInitialSavePixmapBuffer(1, 1, "jpg", null)),
    [255, 255, 255, 255],
);
