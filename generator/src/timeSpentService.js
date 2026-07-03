const {
    hasDocumentValue,
    updateDocumentValue,
} = require("./documentStore");
const { createDefaultDocumentValue } = require("./models");
const { applyTimeSpentTick } = require("./recordingLogic");
const { getTimeSpentUpdateSkipReason } = require("./timeSpentEligibility");

async function updateDocumentTimeSpent(options) {
    const configData = options.configData;
    const nowDocument = options.nowDocument;
    const skipReason = getTimeSpentUpdateSkipReason(configData, nowDocument, hasDocumentValue);
    if (skipReason !== null) {
        return { updated: false, reason: skipReason };
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
