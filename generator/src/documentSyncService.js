const { buildNowDocument, getNowTimeString } = require("./documentState");
const { syncDocumentCreateTime } = require("./documentSettingsService");
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
    const syncDocumentCreateTimeFn = options.syncDocumentCreateTime || syncDocumentCreateTime;
    const writeNowDocumentFn = options.writeNowDocument || writeNowDocument;

    let documentInfo = null;
    let documentCreateTime = null;
    try{
        documentInfo = await generator.getDocumentInfo();
        const documentSettings = await generator.getDocumentSettingsForPlugin(documentInfo.id, pluginName);
        documentCreateTime = await syncDocumentCreateTimeFn({
            generator,
            pluginName,
            documentInfo,
            documentSettings,
            documentIdToCreateTime,
            createTimeFactory,
        });
    } catch (error) {
        return resetNowDocumentFn();
    }

    ensureDocumentValueFn(documentCreateTime);

    const nowDocument = buildNowDocument(documentInfo, documentCreateTime, captureGate.isActive());
    writeNowDocumentFn(nowDocument);
    return nowDocument;
}

module.exports = {
    syncNowDocument,
};
