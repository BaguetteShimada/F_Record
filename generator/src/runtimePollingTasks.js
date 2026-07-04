function createRuntimePollingTaskDefinitions(options) {
    return [
        {
            name: "loopUpdateConfigData",
            intervalMs: 500,
            run: options.updateConfigData,
            runImmediately: true,
        },
        {
            name: "loopUpdateDocument",
            intervalMs: 500,
            run: options.updateDocument,
            runImmediately: true,
        },
        {
            name: "loopUpdateDocumentTimeSpent",
            intervalMs: 1000,
            run: options.updateDocumentTimeSpent,
            runImmediately: false,
        },
    ];
}

module.exports = {
    createRuntimePollingTaskDefinitions,
};
