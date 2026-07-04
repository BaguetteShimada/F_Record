const assert = require("assert");
const { readConfigData } = require("../src/configStore");

const ensuredDirectories = [];
const readFiles = [];
const fallback = {
    isEnabled: false,
    processImageFolderPath: "C:/fallback/processImages",
    resolution: "1080",
    quality: "70",
    idleTimeout: "1",
    language: "cn",
    lastExportTime: null,
};

const configData = readConfigData(fallback, {
    rootDir: "C:/F_Record",
    filePath: "C:/F_Record/configData.json",
    ensureDirectory: directoryPath => ensuredDirectories.push(directoryPath),
    readJsonFile: filePath => {
        readFiles.push(filePath);
        return {
            isEnabled: true,
            processImageFolderPath: "C:/recordings",
            resolution: 123,
            quality: "90",
            idleTimeout: "0",
            language: "en",
            lastExportTime: 42,
        };
    },
});

assert.deepStrictEqual(ensuredDirectories, ["C:/F_Record"]);
assert.deepStrictEqual(readFiles, ["C:/F_Record/configData.json"]);
assert.deepStrictEqual(configData, {
    isEnabled: true,
    processImageFolderPath: "C:/recordings",
    resolution: "1080",
    quality: "90",
    idleTimeout: "0",
    language: "en",
    lastExportTime: 42,
});

assert.deepStrictEqual(
    readConfigData(fallback, {
        rootDir: "C:/F_Record",
        filePath: "C:/F_Record/configData.json",
        ensureDirectory: () => {},
        readJsonFile: () => null,
    }),
    fallback,
);
