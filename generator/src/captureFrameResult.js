function createCaptureSkippedResult(reason) {
    return {
        saved: false,
        reason,
    };
}

function createCaptureSavedResult(imageFilePath, imageName, documentValue) {
    return {
        saved: true,
        imageFilePath,
        imageName,
        documentValue,
    };
}

module.exports = {
    createCaptureSavedResult,
    createCaptureSkippedResult,
};
