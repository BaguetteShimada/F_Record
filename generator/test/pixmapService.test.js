const assert = require("assert");
const { getPixmapAndSaveSettings } = require("../src/pixmapService");

(async () => {
    const documentBounds = { left: 0, top: 0, right: 1920, bottom: 1080 };
    const pixmapBounds = { left: 0, top: 0, right: 1920, bottom: 1080 };
    const finalPixmap = { bounds: pixmapBounds, pixels: "final" };
    const calls = [];
    const generator = {
        getDocumentInfo: async documentId => {
            calls.push(["getDocumentInfo", documentId]);
            return { id: documentId, bounds: documentBounds };
        },
        getDocumentPixmap: async (documentId, options) => {
            calls.push(["getDocumentPixmap", documentId, options]);
            if (options.boundsOnly) {
                return { bounds: pixmapBounds };
            }
            return finalPixmap;
        },
    };

    const [pixmap, saveSettings] = await getPixmapAndSaveSettings(
        generator,
        7,
        { resolution: "540", quality: "80" },
    );

    assert.strictEqual(pixmap, finalPixmap);
    assert.deepStrictEqual(saveSettings, {
        format: "jpg",
        quality: 80,
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        extract: { x: 0, y: 0, width: 960, height: 540 },
    });
    assert.deepStrictEqual(calls, [
        ["getDocumentInfo", 7],
        ["getDocumentPixmap", 7, {
            inputRect: documentBounds,
            outputRect: documentBounds,
            boundsOnly: true,
        }],
        ["getDocumentPixmap", 7, {
            inputRect: documentBounds,
            outputRect: documentBounds,
            maxDimension: 960,
        }],
    ]);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
