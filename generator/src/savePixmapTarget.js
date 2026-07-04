const path = require("path");
const { ensureDirectory } = require("./storage");

function getSavePixmapTargetDirectory(filePath) {
    return path.dirname(filePath);
}

function ensureSavePixmapTargetDirectory(filePath, ensureDirectoryFn) {
    const targetDirectory = getSavePixmapTargetDirectory(filePath);
    (ensureDirectoryFn || ensureDirectory)(targetDirectory);
    return targetDirectory;
}

module.exports = {
    ensureSavePixmapTargetDirectory,
    getSavePixmapTargetDirectory,
};
