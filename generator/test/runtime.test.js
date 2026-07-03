const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-runtime-"));
const originalUserProfile = process.env.USERPROFILE;
const originalHome = process.env.HOME;

if (process.platform === "win32") {
    process.env.USERPROFILE = tempRoot;
} else {
    process.env.HOME = tempRoot;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        const { createRuntime } = require("../src/runtime");
        const events = [];
        const generator = {
            _logger: {
                error: (message, details) => events.push(["error", message, details]),
            },
            addPhotoshopEventListener: (eventName, handler) => {
                events.push(["listener", eventName, typeof handler]);
            },
            getDocumentInfo: async () => ({
                id: 7,
                file: "C:\\Users\\Admin\\Pictures\\Sketch.psd",
                bounds: { left: 0, top: 0, right: 100, bottom: 100 },
            }),
            getDocumentSettingsForPlugin: async () => ({}),
            setDocumentSettingsForPlugin: async settings => {
                events.push(["settings", settings.createTime]);
            },
        };

        const runtime = createRuntime();
        runtime.init(generator, {});
        await wait(20);
        runtime.stop();

        assert.ok(events.some(event => event[0] === "listener" && event[1] === "imageChanged" && event[2] === "function"));
        assert.ok(events.some(event => event[0] === "settings" && /^\d{4}-\d{2}-\d{2}/.test(event[1])));

        const eventCountAfterStop = events.length;
        await wait(520);
        assert.strictEqual(events.length, eventCountAfterStop);

        const documentCreateTime = "2026-07-03-12-00-00-000";
        const enabledConfig = {
            isEnabled: true,
            processImageFolderPath: path.join(tempRoot, "processImages"),
            resolution: "1080",
            quality: "70",
            idleTimeout: "1",
            language: "cn",
            lastExportTime: null,
        };
        const captureCalls = [];
        let imageChangedHandler = null;
        const captureGenerator = {
            _logger: {
                error: (message, details) => events.push(["capture-error", message, details]),
            },
            addPhotoshopEventListener: (eventName, handler) => {
                assert.strictEqual(eventName, "imageChanged");
                imageChangedHandler = handler;
            },
            getDocumentInfo: async () => ({
                id: 8,
                file: "C:\\Users\\Admin\\Pictures\\Capture.psd",
                bounds: { left: 0, top: 0, right: 100, bottom: 100 },
            }),
            getDocumentSettingsForPlugin: async () => ({ createTime: documentCreateTime }),
            setDocumentSettingsForPlugin: async () => {
                throw new Error("should not persist when createTime exists");
            },
        };

        const captureRuntime = createRuntime({
            readConfigData: () => enabledConfig,
            getPixmapAndSaveSettings: async (generatorArg, documentId, configData) => {
                assert.strictEqual(generatorArg, captureGenerator);
                assert.strictEqual(documentId, 8);
                assert.strictEqual(configData, enabledConfig);
                return [{ pixels: "pixmap" }, { quality: 70 }];
            },
            saveCaptureFrame: async options => {
                captureCalls.push(options);
                return { saved: true };
            },
            nowMsFactory: () => 3000,
        });

        captureRuntime.init(captureGenerator, {});
        await wait(20);
        assert.strictEqual(typeof imageChangedHandler, "function");

        await imageChangedHandler({ id: 8, layers: [{ pixels: true }] });
        captureRuntime.stop();

        assert.strictEqual(captureCalls.length, 1);
        assert.strictEqual(captureCalls[0].documentCreateTime, documentCreateTime);
        assert.deepStrictEqual(captureCalls[0].pixmap, { pixels: "pixmap" });
        assert.deepStrictEqual(captureCalls[0].saveSettings, { quality: 70 });
        assert.strictEqual(captureCalls[0].configData, enabledConfig);

        const failureEvents = [];
        const recoveryCaptureCalls = [];
        const pollingRuns = [];
        let recoveryHandler = null;
        let shouldFailPixmap = true;
        const recoveryGenerator = {
            _logger: {},
            addPhotoshopEventListener: (eventName, handler) => {
                assert.strictEqual(eventName, "imageChanged");
                recoveryHandler = handler;
            },
            getDocumentInfo: async () => ({
                id: 9,
                file: "C:\\Users\\Admin\\Pictures\\Recovery.psd",
                bounds: { left: 0, top: 0, right: 100, bottom: 100 },
            }),
            getDocumentSettingsForPlugin: async () => ({ createTime: documentCreateTime }),
            setDocumentSettingsForPlugin: async () => {
                throw new Error("should not persist when createTime exists");
            },
        };
        const recoveryRuntime = createRuntime({
            createLogger: () => ({
                error: (message, details) => failureEvents.push([message, details && details.message]),
            }),
            createPollingTask: options => ({
                start: () => {
                    pollingRuns.push(Promise.resolve(options.run()));
                },
                stop: () => {},
            }),
            readConfigData: () => enabledConfig,
            getPixmapAndSaveSettings: async () => {
                if (shouldFailPixmap) {
                    shouldFailPixmap = false;
                    throw new Error("pixmap failed");
                }
                return [{ pixels: "recovered" }, { quality: 80 }];
            },
            saveCaptureFrame: async options => {
                recoveryCaptureCalls.push(options);
                return { saved: true };
            },
            nowMsFactory: () => 4000,
        });

        recoveryRuntime.init(recoveryGenerator, {});
        await Promise.all(pollingRuns);
        assert.strictEqual(typeof recoveryHandler, "function");

        await recoveryHandler({ id: 9, layers: [{ pixels: true }] });
        await recoveryHandler({ id: 9, layers: [{ pixels: true }] });
        recoveryRuntime.stop();

        assert.deepStrictEqual(failureEvents, [["handlePixelChanged", "pixmap failed"]]);
        assert.strictEqual(recoveryCaptureCalls.length, 1);
        assert.deepStrictEqual(recoveryCaptureCalls[0].pixmap, { pixels: "recovered" });
    } finally {
        if (originalUserProfile === undefined) {
            delete process.env.USERPROFILE;
        } else {
            process.env.USERPROFILE = originalUserProfile;
        }
        if (originalHome === undefined) {
            delete process.env.HOME;
        } else {
            process.env.HOME = originalHome;
        }
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
