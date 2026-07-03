const Mutex = require('./mutex');
const { createCaptureGate } = require("./captureGate");
const { saveCaptureFrame } = require("./captureService");
const { readConfigData } = require("./configStore");
const { syncNowDocument } = require("./documentSyncService");
const { createLogger } = require("./logger");
const { createPollingTask } = require("./pollingTask");
const { createImageChangedHandler } = require("./recordingEventService");
const { shouldHandleImageChanged } = require("./recordingLogic");
const { getPixmapAndSaveSettings } = require("./pixmapService");
const { createRuntimePollingService } = require("./runtimePollingService");
const { updateDocumentTimeSpent: updateDocumentTimeSpentService } = require("./timeSpentService");
const { createDefaultConfigData } = require("./models");

function createRuntime(dependencies) {
    const deps = Object.assign({
        createCaptureGate,
        createDefaultConfigData,
        createImageChangedHandler,
        createLogger,
        createPollingTask,
        createRuntimePollingService,
        getPixmapAndSaveSettings,
        nowMsFactory: () => new Date().getTime(),
        readConfigData,
        saveCaptureFrame,
        shouldHandleImageChanged,
        syncNowDocument,
        updateDocumentTimeSpent: updateDocumentTimeSpentService,
    }, dependencies);

    let _generator = null;
    let _logger = deps.createLogger(null);

    const pluginName = "F_Record";

    let _configData = null;
    const defaultConfigData = deps.createDefaultConfigData();

    let _nowDocument = null;

    const documentIdToCreateTime = {};

    const mutex = new Mutex();
    const captureGate = deps.createCaptureGate();
    let pollingService = null;

    async function updateDocumentTimeSpent() {
        await deps.updateDocumentTimeSpent({
            configData: _configData,
            nowDocument: _nowDocument,
            mutex,
        });
    }

    function updateConfigData() {
        _configData = deps.readConfigData(defaultConfigData);
    }

    async function updateDocument() {
        _nowDocument = await deps.syncNowDocument({
            generator: _generator,
            pluginName,
            documentIdToCreateTime,
            captureGate,
        });
    }

    function startPollingTasks() {
        pollingService = deps.createRuntimePollingService({
            createPollingTask: deps.createPollingTask,
            logger: _logger,
            updateConfigData,
            updateDocument,
            updateDocumentTimeSpent,
        });
        pollingService.start();
    }

    function stopPollingTasks() {
        if (pollingService !== null) {
            pollingService.stop();
            pollingService = null;
        }
    }

    function init(generator, config) {
        _generator = generator;
        _logger = deps.createLogger(_generator._logger);
        const handleImageChanged = deps.createImageChangedHandler({
            captureGate,
            generator: _generator,
            getConfigData: () => _configData,
            getNowDocument: () => _nowDocument,
            getPixmapAndSaveSettings: deps.getPixmapAndSaveSettings,
            logger: _logger,
            mutex,
            nowMsFactory: deps.nowMsFactory,
            saveCaptureFrame: deps.saveCaptureFrame,
            shouldHandleImageChanged: deps.shouldHandleImageChanged,
        });
        stopPollingTasks();
        startPollingTasks();
        _generator.addPhotoshopEventListener("imageChanged", handleImageChanged);
    }

    return {
        init,
        stop: stopPollingTasks,
    };
}

module.exports = {
    createRuntime,
};
