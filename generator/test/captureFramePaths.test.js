const assert = require("assert");
const path = require("path");
const {
    getCaptureImageFilePath,
    getCaptureImageFolderPath,
} = require("../src/captureFramePaths");

const processImageFolderPath = path.join("C:", "F_Record", "processImages");
const documentCreateTime = "2026-07-04-12-00-00-000";
const imageName = "000123.jpg";

assert.strictEqual(
    getCaptureImageFolderPath(processImageFolderPath, documentCreateTime),
    path.join(processImageFolderPath, documentCreateTime),
);

assert.strictEqual(
    getCaptureImageFilePath(processImageFolderPath, documentCreateTime, imageName),
    path.join(processImageFolderPath, documentCreateTime, imageName),
);
