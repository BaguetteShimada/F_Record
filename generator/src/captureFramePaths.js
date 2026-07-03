const path = require("path");

function getCaptureImageFolderPath(processImageFolderPath, documentCreateTime) {
    return path.join(processImageFolderPath, documentCreateTime);
}

function getCaptureImageFilePath(processImageFolderPath, documentCreateTime, imageName) {
    return path.join(getCaptureImageFolderPath(processImageFolderPath, documentCreateTime), imageName);
}

module.exports = {
    getCaptureImageFolderPath,
    getCaptureImageFilePath,
};
