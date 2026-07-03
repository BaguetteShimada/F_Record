const {
    hasDocumentValue,
    updateDocumentValue,
} = require("./documentStore");
const { createDefaultDocumentValue } = require("./models");
const { applyTimeSpentTick } = require("./recordingLogic");

async function updateDocumentTimeSpent(options) {
    const configData = options.configData;
    const nowDocument = options.nowDocument;
    if (configData === null || nowDocument === null) {
        return { updated: false, reason: "not-ready" };
    }
    if (configData.isEnabled === false) {
        return { updated: false, reason: "disabled" };
    }
    if (nowDocument.id === null || nowDocument.createTime === null) {
        return { updated: false, reason: "no-document" };
    }
    if (!hasDocumentValue(nowDocument.createTime)) {
        return { updated: false, reason: "missing-document-value" };
    }

    const nowMsFactory = options.nowMsFactory || (() => new Date().getTime());
    const unlock = await options.mutex.lock();
    try {
        const nowMs = nowMsFactory();
        const documentValue = updateDocumentValue(
            nowDocument.createTime,
            documentValue => applyTimeSpentTick(documentValue, configData.idleTimeout, nowMs),
            createDefaultDocumentValue(),
        );
        return { updated: true, documentValue };
    } finally {
        unlock();
    }
}

module.exports = {
    updateDocumentTimeSpent,
};
