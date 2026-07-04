const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadModelsModule() {
    const modulePath = path.join(__dirname, "..", "src", "models.js");
    const source = fs.readFileSync(modulePath, "utf8");
    const module = { exports: {} };
    const context = {
        isFinite,
        module,
        exports: module.exports,
        require(request) {
            if (request === "path") {
                return path;
            }
            if (request === "./paths") {
                return {
                    F_Record_Dir: "C:/Users/Admin/AppData/Roaming/F_Record",
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(source, context, { filename: modulePath });
    return module.exports;
}

const {
    createDefaultConfigData,
    createDefaultDocumentValue,
    createDefaultNowDocument,
    normalizeConfigData,
    normalizeDocumentValue,
} = loadModelsModule();

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

assert.deepStrictEqual(
    normalize(createDefaultConfigData()),
    {
        isEnabled: false,
        processImageFolderPath: path.join("C:/Users/Admin/AppData/Roaming/F_Record", "processImages"),
        resolution: "1080",
        quality: "70",
        idleTimeout: "1",
        language: "cn",
        lastExportTime: null,
    },
);
assert.deepStrictEqual(
    normalize(createDefaultNowDocument()),
    {
        id: null,
        createTime: null,
        name: null,
        isGettingImage: null,
        bounds: null,
    },
);
assert.deepStrictEqual(
    normalize(createDefaultDocumentValue()),
    {
        count: 0,
        timeSpent: 0,
        lastModifiedTime: null,
    },
);

const fallbackConfig = {
    isEnabled: false,
    processImageFolderPath: "C:/fallback/processImages",
    resolution: "1080",
    quality: "70",
    idleTimeout: "1",
    language: "cn",
    lastExportTime: null,
};
assert.deepStrictEqual(
    normalize(normalizeConfigData({
        isEnabled: true,
        processImageFolderPath: "C:/recordings",
        resolution: 123,
        quality: "90",
        idleTimeout: "0",
        language: "en",
        lastExportTime: Number.POSITIVE_INFINITY,
    }, fallbackConfig)),
    {
        isEnabled: true,
        processImageFolderPath: "C:/recordings",
        resolution: "1080",
        quality: "90",
        idleTimeout: "0",
        language: "en",
        lastExportTime: null,
    },
);
assert.notStrictEqual(normalizeConfigData(null, fallbackConfig), fallbackConfig);
assert.deepStrictEqual(normalize(normalizeConfigData(null, fallbackConfig)), fallbackConfig);

const fallbackDocumentValue = {
    count: 1,
    timeSpent: 2,
    lastModifiedTime: 3,
};
assert.deepStrictEqual(
    normalize(normalizeDocumentValue({
        count: 4,
        timeSpent: Number.NaN,
        lastModifiedTime: null,
    }, fallbackDocumentValue)),
    {
        count: 4,
        timeSpent: 2,
        lastModifiedTime: null,
    },
);
assert.notStrictEqual(normalizeDocumentValue([], fallbackDocumentValue), fallbackDocumentValue);
assert.deepStrictEqual(normalize(normalizeDocumentValue([], fallbackDocumentValue)), fallbackDocumentValue);
