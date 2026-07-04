const { getNowTimeString, resolveDocumentCreateTime } = require("./documentState");

async function syncDocumentCreateTime(options) {
    const generator = options.generator;
    const pluginName = options.pluginName;
    const documentInfo = options.documentInfo;
    const documentSettings = options.documentSettings;
    const documentIdToCreateTime = options.documentIdToCreateTime;
    const createTimeFactory = options.createTimeFactory || getNowTimeString;

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
    return documentSettings.createTime;
}

module.exports = {
    syncDocumentCreateTime,
};
