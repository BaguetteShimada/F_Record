const assert = require("assert");
const { writeSavePixmapImage } = require("../src/savePixmapWriter");

function createFakeImage(events) {
    return {
        quality(value) {
            events.push(["quality", value]);
            return this;
        },
        async writeAsync(filePath) {
            events.push(["writeAsync", filePath]);
        },
    };
}

(async () => {
    const pngEvents = [];
    await writeSavePixmapImage(createFakeImage(pngEvents), "C:/recordings/000001.png", "png", 200);
    assert.deepStrictEqual(pngEvents, [
        ["writeAsync", "C:/recordings/000001.png"],
    ]);

    const jpgEvents = [];
    await writeSavePixmapImage(createFakeImage(jpgEvents), "C:/recordings/000001.jpg", "jpg", 120);
    assert.deepStrictEqual(jpgEvents, [
        ["quality", 100],
        ["writeAsync", "C:/recordings/000001.jpg"],
    ]);

    const defaultEvents = [];
    await writeSavePixmapImage(createFakeImage(defaultEvents), "C:/recordings/000001.jpg", "gif", -1);
    assert.deepStrictEqual(defaultEvents, [
        ["quality", 0],
        ["writeAsync", "C:/recordings/000001.jpg"],
    ]);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
