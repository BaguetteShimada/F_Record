const { createPixmapSettings } = require("./pixmapSettings");
const {
    createBoundsOnlyPixmapOptions,
    createScaledPixmapOptions,
} = require("./pixmapRequestOptions");

async function getPixmapAndSaveSettings(generator, documentId, configData) {
    const documentInfo = await generator.getDocumentInfo(documentId);
    const documentBounds = documentInfo.bounds;

    let pixmap = await generator.getDocumentPixmap(documentId, createBoundsOnlyPixmapOptions(documentBounds));
    const pixmapBounds = pixmap.bounds;
    const pixmapSettings = createPixmapSettings(documentBounds, pixmapBounds, configData);

    pixmap = await generator.getDocumentPixmap(
        documentId,
        createScaledPixmapOptions(documentBounds, pixmapSettings.maxDimension),
    );

    return [pixmap, pixmapSettings.saveSettings];
}

module.exports = {
    getPixmapAndSaveSettings,
};
