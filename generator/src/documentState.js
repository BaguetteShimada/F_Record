const path = require("path");
const { createDefaultNowDocument } = require("./models");

function resolveDocumentCreateTime(documentInfo, documentSettings, knownCreateTimes, createTimeFactory) {
    if (documentSettings.createTime !== undefined) {
        return {
            createTime: documentSettings.createTime,
            shouldPersist: false,
        };
    }

    const knownCreateTime = knownCreateTimes[documentInfo.id];
    return {
        createTime: knownCreateTime === undefined ? createTimeFactory() : knownCreateTime,
        shouldPersist: true,
    };
}

function buildNowDocument(documentInfo, createTime, isGettingImage) {
    return {
        ...createDefaultNowDocument(),
        id: documentInfo.id,
        createTime,
        name: path.parse(documentInfo.file).name,
        isGettingImage,
        bounds: documentInfo.bounds,
    };
}

function getNowTimeString() {
    const now = new Date();
    return now.getFullYear() + "-" +
        pad(now.getMonth() + 1, 2) + "-" +
        pad(now.getDate(), 2) + "-" +
        pad(now.getHours(), 2) + "-" +
        pad(now.getMinutes(), 2) + "-" +
        pad(now.getSeconds(), 2) + "-" +
        pad(now.getMilliseconds(), 3);
}

function pad(num, size) {
    let value = num.toString();
    while (value.length < size) {
        value = "0" + value;
    }
    return value;
}

module.exports = {
    buildNowDocument,
    getNowTimeString,
    resolveDocumentCreateTime,
};
