const path = require("path");
const savePixmap = require("./savePixmap");
const {
    hasDocumentValue,
    readDocumentValue,
    updateDocumentValue,
} = require("./documentStore");
const { createDefaultDocumentValue } = require("./models");
const { getNextImageName, markImageSaved } = require("./recordingLogic");
const { ensureDirectory } = require("./storage");

async function saveCaptureFrame(options) {
    const mutex = options.mutex;
    const documentCreateTime = options.documentCreateTime;
    const imageFolderPath = path.join(options.configData.processImageFolderPath, documentCreateTime);
    const nowMsFactory = options.nowMsFactory || (() => new Date().getTime());
    const savePixmapFn = options.savePixmapFn || savePixmap;

    ensureDirectory(imageFolderPath);

    const unlock = await mutex.lock();
    try {
        if (!hasDocumentValue(documentCreateTime)) {
            return { saved: false, reason: "missing-document-value" };
        }

        const documentValue = readDocumentValue(documentCreateTime, createDefaultDocumentValue());
        const imageName = getNextImageName(documentValue.count);
        const imageFilePath = path.join(imageFolderPath, imageName);
        await savePixmapFn(options.pixmap, imageFilePath, options.saveSettings);

        const nowMs = nowMsFactory();
        const nextDocumentValue = updateDocumentValue(
            documentCreateTime,
            documentValue => markImageSaved(documentValue, nowMs),
            createDefaultDocumentValue(),
        );

        return {
            saved: true,
            imageFilePath,
            imageName,
            documentValue: nextDocumentValue,
        };
    } finally {
        unlock();
    }
}

module.exports = {
    saveCaptureFrame,
};
