const assert = require("assert");
const {
    assignSavePixmapBitmap,
    createSavePixmapImage,
} = require("../src/savePixmapImage");

const targetSize = { width: 2, height: 3 };
const buffer = Buffer.from([1, 2, 3, 4]);

const image = { bitmap: {} };
assert.strictEqual(assignSavePixmapBitmap(image, buffer, targetSize), image);
assert.strictEqual(image.bitmap.data, buffer);
assert.strictEqual(image.bitmap.width, 2);
assert.strictEqual(image.bitmap.height, 3);

const constructorCalls = [];
class FakeJimp {
    constructor(width, height) {
        constructorCalls.push({ width, height });
        this.bitmap = {};
    }
}

const createdImage = createSavePixmapImage(FakeJimp, targetSize, buffer);
assert.deepStrictEqual(constructorCalls, [{ width: 2, height: 3 }]);
assert.strictEqual(createdImage.bitmap.data, buffer);
assert.strictEqual(createdImage.bitmap.width, 2);
assert.strictEqual(createdImage.bitmap.height, 3);
