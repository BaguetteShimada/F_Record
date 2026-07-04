const savePixmap = require("./savePixmap");
const {
    hasDocumentValue,
    readDocumentValue,
    updateDocumentValue,
} = require("./documentStore");
const {
    getCaptureImageFilePath,
    getCaptureImageFolderPath,
} = require("./captureFramePaths");
const {
    createCaptureSavedResult,
    createCaptureSkippedResult,
} = require("./captureFrameResult");
const { createDefaultDocumentValue } = require("./models");
const { getNextImageName, markImageSaved } = require("./recordingLogic");
const { ensureDirectory } = require("./storage");

async function saveCaptureFrame(options) {
    const mutex = options.mutex;
    const documentCreateTime = options.documentCreateTime;
    const imageFolderPath = getCaptureImageFolderPath(options.configData.processImageFolderPath, documentCreateTime);
    const nowMsFactory = options.nowMsFactory || (() => new Date().getTime());
    const savePixmapFn = options.savePixmapFn || savePixmap;

    ensureDirectory(imageFolderPath);

    const unlock = await mutex.lock();
    try {
        if (!hasDocumentValue(documentCreateTime)) {
            return createCaptureSkippedResult("missing-document-value");
        }

        const documentValue = readDocumentValue(documentCreateTime, createDefaultDocumentValue());
        const imageName = getNextImageName(documentValue.count);
        const imageFilePath = getCaptureImageFilePath(options.configData.processImageFolderPath, documentCreateTime, imageName);
        await savePixmapFn(options.pixmap, imageFilePath, options.saveSettings);

        const nowMs = nowMsFactory();
        const nextDocumentValue = updateDocumentValue(
            documentCreateTime,
            documentValue => markImageSaved(documentValue, nowMs),
            createDefaultDocumentValue(),
        );

        return createCaptureSavedResult(imageFilePath, imageName, nextDocumentValue);
    } finally {
        unlock();
    }
}

module.exports = {
    saveCaptureFrame,
};
