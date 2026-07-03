function getTimeSpentUpdateSkipReason(configData, nowDocument, hasDocumentValue) {
    if (configData === null || nowDocument === null) {
        return "not-ready";
    }
    if (configData.isEnabled === false) {
        return "disabled";
    }
    if (nowDocument.id === null || nowDocument.createTime === null) {
        return "no-document";
    }
    if (!hasDocumentValue(nowDocument.createTime)) {
        return "missing-document-value";
    }
    return null;
}

module.exports = {
    getTimeSpentUpdateSkipReason,
};
