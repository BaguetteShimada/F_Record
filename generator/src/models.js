const path = require("path");
const { F_Record_Dir } = require("./paths");

const VALID_RESOLUTIONS = ["360", "720", "1080", "1440"];
const VALID_QUALITIES = ["20", "70", "90"];
const VALID_IDLE_TIMEOUTS = ["0", "1", "5", "10", "30"];
const VALID_LANGUAGES = ["cn", "en"];

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
        resolution: normalizeResolution(value.resolution, base.resolution),
        quality: normalizeQuality(value.quality, base.quality),
        idleTimeout: normalizeIdleTimeout(value.idleTimeout, base.idleTimeout),
        language: normalizeLanguage(value.language, base.language),
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

function readStringOption(value, fallback, validValues) {
    if (typeof value !== "string") {
        return fallback;
    }
    return validValues.includes(value) ? value : fallback;
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

function normalizeResolution(value, fallback) {
    return readStringOption(value, fallback === undefined ? createDefaultConfigData().resolution : fallback, VALID_RESOLUTIONS);
}

function normalizeQuality(value, fallback) {
    return readStringOption(value, fallback === undefined ? createDefaultConfigData().quality : fallback, VALID_QUALITIES);
}

function normalizeIdleTimeout(value, fallback) {
    return readStringOption(value, fallback === undefined ? createDefaultConfigData().idleTimeout : fallback, VALID_IDLE_TIMEOUTS);
}

function normalizeLanguage(value, fallback) {
    return readStringOption(value, fallback === undefined ? createDefaultConfigData().language : fallback, VALID_LANGUAGES);
}

module.exports = {
    VALID_IDLE_TIMEOUTS,
    VALID_LANGUAGES,
    VALID_QUALITIES,
    VALID_RESOLUTIONS,
    createDefaultConfigData,
    createDefaultNowDocument,
    createDefaultDocumentValue,
    normalizeIdleTimeout,
    normalizeLanguage,
    normalizeConfigData,
    normalizeQuality,
    normalizeResolution,
    normalizeDocumentValue,
};
