const { buildNowDocument, getNowTimeString, resolveDocumentCreateTime } = require("./documentState");
const {
    ensureDocumentValue,
    resetNowDocument,
    writeNowDocument,
} = require("./documentStore");

async function syncNowDocument(options) {
    const generator = options.generator;
    const pluginName = options.pluginName;
    const documentIdToCreateTime = options.documentIdToCreateTime;
    const captureGate = options.captureGate;
    const createTimeFactory = options.createTimeFactory || getNowTimeString;
    const ensureDocumentValueFn = options.ensureDocumentValue || ensureDocumentValue;
    const resetNowDocumentFn = options.resetNowDocument || resetNowDocument;
    const writeNowDocumentFn = options.writeNowDocument || writeNowDocument;

    let documentInfo = null;
    let documentSettings = null;
    try{
        documentInfo = await generator.getDocumentInfo();
        documentSettings = await generator.getDocumentSettingsForPlugin(documentInfo.id, pluginName);
        const createTimeResult = resolveDocumentCreateTime(
            documentInfo,
            documentSettings,
            documentIdToCreateTime,
            createTimeFactory,
        );
        documentSettings.createTime = createTimeResult.createTime;
        if (createTimeResult.shouldPersist) {
            await generator.setDocumentSettingsForPlugin(documentSettings, pluginName);
        }
        documentIdToCreateTime[documentInfo.id] = documentSettings.createTime;
    } catch (error) {
        return resetNowDocumentFn();
    }

    ensureDocumentValueFn(documentSettings.createTime);

    const nowDocument = buildNowDocument(documentInfo, documentSettings.createTime, captureGate.isActive());
    writeNowDocumentFn(nowDocument);
    return nowDocument;
}

module.exports = {
    syncNowDocument,
};
