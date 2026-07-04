const assert = require("assert");
const { assertValidSavePixmapInput } = require("../src/savePixmapValidation");

assert.doesNotThrow(() => {
    assertValidSavePixmapInput(
        { pixels: Buffer.from([0, 1, 2, 3]) },
        "C:/recordings/000001.jpg",
        { quality: 70 },
    );
});

assert.throws(
    () => assertValidSavePixmapInput(null, "C:/recordings/000001.jpg", { quality: 70 }),
    /缺少必要参数/,
);

assert.throws(
    () => assertValidSavePixmapInput({ pixels: Buffer.from([]) }, "", { quality: 70 }),
    /缺少必要参数/,
);

assert.throws(
    () => assertValidSavePixmapInput({ pixels: Buffer.from([]) }, "C:/recordings/000001.jpg", null),
    /缺少必要参数/,
);

assert.throws(
    () => assertValidSavePixmapInput({ pixels: [0, 1, 2, 3] }, "C:/recordings/000001.jpg", { quality: 70 }),
    /无效的像素数据/,
);

assert.throws(
    () => assertValidSavePixmapInput({}, "C:/recordings/000001.jpg", { quality: 70 }),
    /无效的像素数据/,
);
