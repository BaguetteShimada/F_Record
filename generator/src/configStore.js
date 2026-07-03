const { F_Record_Dir, configDataFilePath } = require("./paths");
const { createDefaultConfigData, normalizeConfigData } = require("./models");
const { ensureDirectory, readJsonFile } = require("./storage");

function readConfigData(fallback) {
    ensureDirectory(F_Record_Dir);
    return normalizeConfigData(readJsonFile(configDataFilePath), fallback || createDefaultConfigData());
}

module.exports = {
    readConfigData,
};
