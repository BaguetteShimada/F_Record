const { saveCaptureFrame } = require("./captureService");
const { getPixmapAndSaveSettings } = require("./pixmapService");
const { shouldHandleImageChanged } = require("./recordingLogic");

function createImageChangedHandler(options) {
    const deps = Object.assign({
        getPixmapAndSaveSettings,
        nowMsFactory: () => new Date().getTime(),
        saveCaptureFrame,
        shouldHandleImageChanged,
    }, options);

    return async function handleImageChanged(changedEvent) {
        try{
            const configData = deps.getConfigData();
            const nowDocument = deps.getNowDocument();
            if (!deps.shouldHandleImageChanged(changedEvent, configData, nowDocument, deps.nowMsFactory())) {
                return;
            }
            await handlePixelChanged(Object.assign({}, deps, {
                changedEvent,
                configData,
                documentCreateTime: nowDocument.createTime,
            }));
        } catch (error) {
            deps.logger.error("handleImageChanged", error);
        }
    };
}

async function handlePixelChanged(options) {
    await options.captureGate.run(async () => {
        try{
            let pixmap = null;
            let saveSettings = null;
            [pixmap, saveSettings] = await options.getPixmapAndSaveSettings(
                options.generator,
                options.changedEvent.id,
                options.configData,
            );

            await options.saveCaptureFrame({
                mutex: options.mutex,
                pixmap,
                saveSettings,
                configData: options.configData,
                documentCreateTime: options.documentCreateTime,
            });
        } catch (error) {
            options.logger.error("handlePixelChanged", error);
        }
    });
}

module.exports = {
    createImageChangedHandler,
    handlePixelChanged,
};
