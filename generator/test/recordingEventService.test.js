const assert = require("assert");
const {
    createImageChangedHandler,
    handlePixelChanged,
} = require("../src/recordingEventService");

function createCaptureGate(events) {
    return {
        run: async task => {
            events.push("gate:start");
            await task();
            events.push("gate:end");
        },
    };
}

(async () => {
    const configData = { isEnabled: true, lastExportTime: null };
    const nowDocument = { id: 7, createTime: "2026-07-03-12-00-00-000" };
    const generator = { name: "generator" };
    const mutex = { name: "mutex" };
    const events = [];
    const captureCalls = [];
    const handler = createImageChangedHandler({
        captureGate: createCaptureGate(events),
        generator,
        getConfigData: () => configData,
        getNowDocument: () => nowDocument,
        getPixmapAndSaveSettings: async (generatorArg, documentId, configArg) => {
            assert.strictEqual(generatorArg, generator);
            assert.strictEqual(documentId, 7);
            assert.strictEqual(configArg, configData);
            return [{ pixels: "pixmap" }, { quality: 70 }];
        },
        logger: {
            error: (message, error) => events.push(["error", message, error.message]),
        },
        mutex,
        nowMsFactory: () => 1000,
        saveCaptureFrame: async options => {
            captureCalls.push(options);
            return { saved: true };
        },
        shouldHandleImageChanged: (changedEvent, configArg, documentArg, nowMs) => {
            assert.strictEqual(changedEvent.id, 7);
            assert.strictEqual(configArg, configData);
            assert.strictEqual(documentArg, nowDocument);
            assert.strictEqual(nowMs, 1000);
            return true;
        },
    });

    await handler({ id: 7, layers: [{ pixels: true }] });

    assert.deepStrictEqual(events, ["gate:start", "gate:end"]);
    assert.strictEqual(captureCalls.length, 1);
    assert.strictEqual(captureCalls[0].mutex, mutex);
    assert.deepStrictEqual(captureCalls[0].pixmap, { pixels: "pixmap" });
    assert.deepStrictEqual(captureCalls[0].saveSettings, { quality: 70 });
    assert.strictEqual(captureCalls[0].configData, configData);
    assert.strictEqual(captureCalls[0].documentCreateTime, nowDocument.createTime);

    const ignoredCalls = [];
    const ignoredHandler = createImageChangedHandler({
        captureGate: createCaptureGate([]),
        generator,
        getConfigData: () => configData,
        getNowDocument: () => nowDocument,
        getPixmapAndSaveSettings: async () => {
            throw new Error("should not read pixmap");
        },
        logger: {
            error: (message, error) => ignoredCalls.push(["error", message, error.message]),
        },
        mutex,
        saveCaptureFrame: async () => {
            ignoredCalls.push(["save"]);
        },
        shouldHandleImageChanged: () => false,
    });

    await ignoredHandler({ id: 7, layers: [] });
    assert.deepStrictEqual(ignoredCalls, []);

    const recoveryEvents = [];
    const recoveryCaptures = [];
    let shouldFailPixmap = true;
    const recoveryHandler = createImageChangedHandler({
        captureGate: createCaptureGate(recoveryEvents),
        generator,
        getConfigData: () => configData,
        getNowDocument: () => nowDocument,
        getPixmapAndSaveSettings: async () => {
            if (shouldFailPixmap) {
                shouldFailPixmap = false;
                throw new Error("pixmap failed");
            }
            return [{ pixels: "recovered" }, { quality: 80 }];
        },
        logger: {
            error: (message, error) => recoveryEvents.push(["error", message, error.message]),
        },
        mutex,
        saveCaptureFrame: async options => {
            recoveryCaptures.push(options);
        },
        shouldHandleImageChanged: () => true,
    });

    await recoveryHandler({ id: 7, layers: [{ pixels: true }] });
    await recoveryHandler({ id: 7, layers: [{ pixels: true }] });

    assert.deepStrictEqual(recoveryEvents, [
        "gate:start",
        ["error", "handlePixelChanged", "pixmap failed"],
        "gate:end",
        "gate:start",
        "gate:end",
    ]);
    assert.strictEqual(recoveryCaptures.length, 1);
    assert.deepStrictEqual(recoveryCaptures[0].pixmap, { pixels: "recovered" });

    const pixelEvents = [];
    await handlePixelChanged({
        captureGate: createCaptureGate(pixelEvents),
        changedEvent: { id: 10 },
        configData,
        documentCreateTime: nowDocument.createTime,
        generator,
        getPixmapAndSaveSettings: async () => [{ pixels: "direct" }, { quality: 60 }],
        logger: {
            error: (message, error) => pixelEvents.push(["error", message, error.message]),
        },
        mutex,
        saveCaptureFrame: async options => {
            pixelEvents.push(["save", options.documentCreateTime, options.saveSettings.quality]);
        },
    });

    assert.deepStrictEqual(pixelEvents, [
        "gate:start",
        ["save", nowDocument.createTime, 60],
        "gate:end",
    ]);

    const skippedPixelEvents = [];
    await handlePixelChanged({
        captureGate: {
            run: async () => {
                skippedPixelEvents.push("gate:skipped");
                return { started: false };
            },
        },
        changedEvent: { id: 10 },
        configData,
        documentCreateTime: nowDocument.createTime,
        generator,
        getPixmapAndSaveSettings: async () => {
            throw new Error("should not read pixmap");
        },
        logger: {
            error: (message, error) => skippedPixelEvents.push(["error", message, error.message]),
        },
        mutex,
        saveCaptureFrame: async () => {
            skippedPixelEvents.push("save");
        },
    });

    assert.deepStrictEqual(skippedPixelEvents, ["gate:skipped"]);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
