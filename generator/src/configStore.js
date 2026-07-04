const { F_Record_Dir, configDataFilePath } = require("./paths");
const { createDefaultConfigData, normalizeConfigData } = require("./models");
const { ensureDirectory, readJsonFile } = require("./storage");

function readConfigData(fallback, options) {
    options = options || {};
    const ensureDirectoryFn = options.ensureDirectory || ensureDirectory;
    const readJsonFileFn = options.readJsonFile || readJsonFile;
    const rootDir = options.rootDir || F_Record_Dir;
    const filePath = options.filePath || configDataFilePath;

    ensureDirectoryFn(rootDir);
    return normalizeConfigData(readJsonFileFn(filePath), fallback || createDefaultConfigData());
}

module.exports = {
    readConfigData,
};
