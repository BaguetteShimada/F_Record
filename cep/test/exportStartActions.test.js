const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportStartActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportStartActions.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
        },
    });

    const module = { exports: {} };
    const context = {
        module,
        exports: module.exports,
        require(request) {
            if (request === "./exportSaveDialog") {
                return {
                    selectExportSavePath() {
                        throw new Error("Default save path selector should not be used in tests");
                    },
                };
            }
            if (request === "./exportSettingsActions") {
                return {
                    createStartedExportSettings(currentExportSettings, savePath) {
                        return {
                            ...currentExportSettings,
                            savePath,
                            isExporting: true,
                        };
                    },
                    createStartExportSettingsChange(savePath) {
                        return {
                            savePath,
                            isExporting: true,
                        };
                    },
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

const { createExportReplayStart } = loadExportStartActionsModule();

const currentExportSettings = {
    isExporting: false,
    aspectRatio: "0",
    duration: "30",
    savePath: null,
};
const translations = [];
const selectorCalls = [];
const exportStart = createExportReplayStart(
    currentExportSettings,
    "Sketch.psd",
    (key) => {
        translations.push(key);
        return `t:${key}`;
    },
    (documentName, title) => {
        selectorCalls.push({ documentName, title });
        return "C:/Videos/Sketch.mp4";
    },
);

assert.deepStrictEqual(translations, ["Select Export Path"]);
assert.deepStrictEqual(selectorCalls, [{ documentName: "Sketch.psd", title: "t:Select Export Path" }]);
assert.deepStrictEqual(normalize(exportStart), {
    savePath: "C:/Videos/Sketch.mp4",
    nextExportSettings: {
        isExporting: true,
        aspectRatio: "0",
        duration: "30",
        savePath: "C:/Videos/Sketch.mp4",
    },
    settingsChange: {
        isExporting: true,
        savePath: "C:/Videos/Sketch.mp4",
    },
});
assert.strictEqual(currentExportSettings.isExporting, false);
assert.strictEqual(currentExportSettings.savePath, null);

const cancelledStart = createExportReplayStart(
    currentExportSettings,
    null,
    (key) => key,
    () => null,
);
assert.strictEqual(cancelledStart, null);
