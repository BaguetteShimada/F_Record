const path = require("path");
const { F_Record_Dir } = require("./paths");

function createDefaultConfigData() {
    return {
        isEnabled: false,
        processImageFolderPath: path.join(F_Record_Dir, "processImages"),
        resolution: "1080",
        quality: "70",
        idleTimeout: "1",
        language: "cn",
        lastExportTime: null,
    };
}

function createDefaultNowDocument() {
    return {
        id: null,
        createTime: null,
        name: null,
        isGettingImage: null,
        bounds: null,
    };
}

function createDefaultDocumentValue() {
    return {
        count: 0,
        timeSpent: 0,
        lastModifiedTime: null,
    };
}

function normalizeConfigData(value, fallback) {
    const base = fallback || createDefaultConfigData();
    if (!isRecord(value)) {
        return Object.assign({}, base);
    }
    return {
        isEnabled: readBoolean(value.isEnabled, base.isEnabled),
        processImageFolderPath: readString(value.processImageFolderPath, base.processImageFolderPath),
        resolution: readString(value.resolution, base.resolution),
        quality: readString(value.quality, base.quality),
        idleTimeout: readString(value.idleTimeout, base.idleTimeout),
        language: readString(value.language, base.language),
        lastExportTime: readNullableNumber(value.lastExportTime, base.lastExportTime),
    };
}

function normalizeDocumentValue(value, fallback) {
    const base = fallback || createDefaultDocumentValue();
    if (!isRecord(value)) {
        return Object.assign({}, base);
    }
    return {
        count: readNumber(value.count, base.count),
        timeSpent: readNumber(value.timeSpent, base.timeSpent),
        lastModifiedTime: readNullableNumber(value.lastModifiedTime, base.lastModifiedTime),
    };
}

function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value, fallback) {
    return typeof value === "string" ? value : fallback;
}

function readBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}

function readNumber(value, fallback) {
    return isFiniteNumber(value) ? value : fallback;
}

function readNullableNumber(value, fallback) {
    if (value === null) {
        return null;
    }
    return isFiniteNumber(value) ? value : fallback;
}

function isFiniteNumber(value) {
    return typeof value === "number" && isFinite(value);
}

module.exports = {
    createDefaultConfigData,
    createDefaultNowDocument,
    createDefaultDocumentValue,
    normalizeConfigData,
    normalizeDocumentValue,
};
