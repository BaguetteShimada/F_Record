const assert = require("assert");
const {
    DEFAULT_BACKGROUND_COLOR,
    assertValidTargetImageSize,
    clampJpgQuality,
    getSavePixmapFormatType,
    getTargetImageSize,
    normalizeSavePixmapSettings,
} = require("../src/savePixmapSettings");

assert.deepStrictEqual(
    normalizeSavePixmapSettings({ width: 120, height: 80 }, { quality: 85 }),
    {
        format: "jpg",
        quality: 85,
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        extract: { x: 0, y: 0, width: 120, height: 80 },
        backgroundColor: DEFAULT_BACKGROUND_COLOR,
    },
);

assert.deepStrictEqual(
    normalizeSavePixmapSettings(
        { width: 120, height: 80 },
        {
            format: "png",
            padding: { left: 1, top: 2, right: 3, bottom: 4 },
            extract: { x: 5, y: 6, width: 7, height: 8 },
            backgroundColor: { r: 1, g: 2, b: 3 },
        },
    ),
    {
        format: "png",
        quality: 70,
        padding: { left: 1, top: 2, right: 3, bottom: 4 },
        extract: { x: 5, y: 6, width: 7, height: 8 },
        backgroundColor: { r: 1, g: 2, b: 3 },
    },
);

assert.strictEqual(getSavePixmapFormatType("PNG"), "png");
assert.strictEqual(getSavePixmapFormatType(null), "jpg");

assert.deepStrictEqual(
    getTargetImageSize(
        { width: 100, height: 50 },
        { left: 1, top: 2, right: 3, bottom: 4 },
    ),
    { width: 104, height: 56 },
);

assert.strictEqual(clampJpgQuality(-1), 0);
assert.strictEqual(clampJpgQuality(80), 80);
assert.strictEqual(clampJpgQuality(120), 100);

assert.doesNotThrow(() => {
    assertValidTargetImageSize({ width: 1, height: 1 });
});
assert.throws(
    () => assertValidTargetImageSize({ width: 0, height: 1 }),
    /目标图像尺寸无效/,
);
assert.throws(
    () => assertValidTargetImageSize({ width: 1, height: 0 }),
    /目标图像尺寸无效/,
);
