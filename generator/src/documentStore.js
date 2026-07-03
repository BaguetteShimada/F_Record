const {
    F_Record_Dir,
    documentValueFolderPath,
    getDocumentValueFilePath,
    nowDocumentFilePath,
} = require("./paths");
const {
    createDefaultDocumentValue,
    createDefaultNowDocument,
    normalizeDocumentValue,
} = require("./models");
const {
    ensureDirectory,
    pathExists,
    readJsonFile,
    writeJsonFileAtomic,
} = require("./storage");

function resetNowDocument() {
    const nowDocument = createDefaultNowDocument();
    writeNowDocument(nowDocument);
    return nowDocument;
}

function writeNowDocument(nowDocument) {
    ensureDirectory(F_Record_Dir);
    writeJsonFileAtomic(nowDocumentFilePath, nowDocument);
}

function ensureDocumentValue(documentCreateTime) {
    ensureDirectory(documentValueFolderPath);
    if (!hasDocumentValue(documentCreateTime)) {
        writeDocumentValue(documentCreateTime, createDefaultDocumentValue());
    }
}

function hasDocumentValue(documentCreateTime) {
    return pathExists(getDocumentValueFilePath(documentCreateTime));
}

function readDocumentValue(documentCreateTime, fallback) {
    return normalizeDocumentValue(
        readJsonFile(getDocumentValueFilePath(documentCreateTime)),
        fallback || createDefaultDocumentValue(),
    );
}

function writeDocumentValue(documentCreateTime, documentValue) {
    ensureDirectory(documentValueFolderPath);
    writeJsonFileAtomic(getDocumentValueFilePath(documentCreateTime), documentValue);
}

function updateDocumentValue(documentCreateTime, updater, fallback) {
    const documentValue = readDocumentValue(documentCreateTime, fallback);
    const nextDocumentValue = updater(documentValue);
    writeDocumentValue(documentCreateTime, nextDocumentValue);
    return nextDocumentValue;
}

module.exports = {
    ensureDocumentValue,
    hasDocumentValue,
    readDocumentValue,
    resetNowDocument,
    updateDocumentValue,
    writeDocumentValue,
    writeNowDocument,
};
