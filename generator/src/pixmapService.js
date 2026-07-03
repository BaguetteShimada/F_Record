const { createPixmapSettings } = require("./pixmapSettings");

async function getPixmapAndSaveSettings(generator, documentId, configData) {
    const documentInfo = await generator.getDocumentInfo(documentId);
    const documentBounds = documentInfo.bounds;

    let pixmap = await generator.getDocumentPixmap(documentId, {
        inputRect: documentBounds,
        outputRect: documentBounds,
        boundsOnly: true,
    });
    const pixmapBounds = pixmap.bounds;
    const pixmapSettings = createPixmapSettings(documentBounds, pixmapBounds, configData);

    pixmap = await generator.getDocumentPixmap(documentId, {
        inputRect: documentBounds,
        outputRect: documentBounds,
        maxDimension: pixmapSettings.maxDimension,
    });

    return [pixmap, pixmapSettings.saveSettings];
}

module.exports = {
    getPixmapAndSaveSettings,
};
