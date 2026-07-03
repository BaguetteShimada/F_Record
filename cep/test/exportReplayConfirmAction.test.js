const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportReplayConfirmActionModule(overrides = {}) {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportReplayConfirmAction.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
        },
    });

    const calls = [];
    const defaultExportProgress = { status: "", percent: 0 };
    const module = { exports: {} };
    const context = {
        Promise,
        module,
        exports: module.exports,
        require(request) {
            if (request === "./models") {
                return {
                    createDefaultExportProgress() {
                        calls.push({ method: "createDefaultExportProgress" });
                        return defaultExportProgress;
                    },
                };
            }
            if (request === "./exportSettingsActions") {
                return {
                    createFinishExportSettingsChange() {
                        calls.push({ method: "createFinishExportSettingsChange" });
                        return { isExporting: false };
                    },
                };
            }
            if (request === "./exportVideoActions") {
                return {
                    openExportedVideo: overrides.openExportedVideo ?? ((savePath, onError) => {
                        calls.push({ method: "openExportedVideo", savePath, onError });
                    }),
                };
            }
            if (request === "./exportNotifications") {
                return {
                    showExportStartedToast: overrides.showExportStartedToast ?? ((t, toastQueue) => {
                        calls.push({ method: "showExportStartedToast", toastQueue });
                    }),
                    showExportSuccessToast: overrides.showExportSuccessToast ?? ((t, toastQueue, onOpen) => {
                        calls.push({ method: "showExportSuccessToast", toastQueue });
                        onOpen();
                    }),
                    showExportFailureToast: overrides.showExportFailureToast ?? ((error, t, toastQueue, onDetails) => {
                        calls.push({ method: "showExportFailureToast", error, toastQueue });
                        onDetails();
                    }),
                };
            }
            if (request === "./exportReplayFlow") {
                return {
                    runExportReplayFlow: overrides.runExportReplayFlow ?? ((configData, documentValue, exportSettings, onProgress) => {
                        calls.push({ method: "runExportReplayFlow", configData, documentValue, exportSettings });
                        onProgress({ status: "Exporting", percent: 50 });
                        return Promise.resolve();
                    }),
                };
            }
            if (request === "./exportStartActions") {
                return {
                    createExportReplayStart: overrides.createExportReplayStart ?? ((exportSettings, documentName, t) => {
                        calls.push({ method: "createExportReplayStart", exportSettings, documentName });
                        return {
                            savePath: "C:/Videos/Sketch.mp4",
                            nextExportSettings: {
                                ...exportSettings,
                                savePath: "C:/Videos/Sketch.mp4",
                                isExporting: true,
                            },
                            settingsChange: {
                                savePath: "C:/Videos/Sketch.mp4",
                                isExporting: true,
                            },
                        };
                    }),
                };
            }
            if (request === "./exportErrorDetailsActions") {
                return {
                    showExportErrorDetails: overrides.showExportErrorDetails ?? ((error, onError) => {
                        calls.push({ method: "showExportErrorDetails", error, onError });
                    }),
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return { ...module.exports, calls, defaultExportProgress };
}

function createOptions(overrides = {}) {
    const events = [];
    const options = {
        configData: { processImageFolderPath: "C:/recordings" },
        documentValue: { name: "Sketch.psd", id: 1, count: 2 },
        exportSettings: { isExporting: false, aspectRatio: "0", duration: "30", savePath: null },
        t: (key) => key,
        close: () => events.push({ method: "close" }),
        setProgress: (progress) => events.push({ method: "setProgress", progress }),
        onExportSettingsChange: (change) => events.push({ method: "onExportSettingsChange", change }),
        onError: (error) => events.push({ method: "onError", error }),
        toastQueue: { name: "toastQueue" },
        ...overrides,
    };
    return { options, events };
}

(async () => {
    {
        const { confirmExportReplay, calls } = loadExportReplayConfirmActionModule();
        const { options, events } = createOptions();

        const didStart = await confirmExportReplay(options);

        assert.strictEqual(didStart, true);
        assert.deepStrictEqual(events, [
            { method: "onExportSettingsChange", change: { savePath: "C:/Videos/Sketch.mp4", isExporting: true } },
            { method: "close" },
            { method: "setProgress", progress: { status: "", percent: 0 } },
            { method: "setProgress", progress: { status: "Exporting", percent: 50 } },
            { method: "onExportSettingsChange", change: { isExporting: false } },
        ]);
        assert.deepStrictEqual(calls.map(call => call.method), [
            "createExportReplayStart",
            "createDefaultExportProgress",
            "showExportStartedToast",
            "runExportReplayFlow",
            "showExportSuccessToast",
            "openExportedVideo",
            "createFinishExportSettingsChange",
        ]);
    }

    {
        const { confirmExportReplay, calls } = loadExportReplayConfirmActionModule({
            createExportReplayStart() {
                calls.push({ method: "createExportReplayStart" });
                return null;
            },
        });
        const { options, events } = createOptions();

        const didStart = await confirmExportReplay(options);

        assert.strictEqual(didStart, false);
        assert.deepStrictEqual(events, []);
        assert.deepStrictEqual(calls.map(call => call.method), ["createExportReplayStart"]);
    }

    {
        const expectedError = new Error("Export failed");
        const { confirmExportReplay, calls } = loadExportReplayConfirmActionModule({
            runExportReplayFlow() {
                calls.push({ method: "runExportReplayFlow" });
                return Promise.reject(expectedError);
            },
        });
        const { options, events } = createOptions();

        const didStart = await confirmExportReplay(options);

        assert.strictEqual(didStart, true);
        assert.deepStrictEqual(events, [
            { method: "onExportSettingsChange", change: { savePath: "C:/Videos/Sketch.mp4", isExporting: true } },
            { method: "close" },
            { method: "setProgress", progress: { status: "", percent: 0 } },
            { method: "onExportSettingsChange", change: { isExporting: false } },
        ]);
        assert.deepStrictEqual(calls.map(call => call.method), [
            "createExportReplayStart",
            "createDefaultExportProgress",
            "showExportStartedToast",
            "runExportReplayFlow",
            "showExportFailureToast",
            "showExportErrorDetails",
            "createFinishExportSettingsChange",
        ]);
        assert.strictEqual(calls.find(call => call.method === "showExportFailureToast").error, expectedError);
        assert.strictEqual(calls.find(call => call.method === "showExportErrorDetails").error, expectedError);
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
