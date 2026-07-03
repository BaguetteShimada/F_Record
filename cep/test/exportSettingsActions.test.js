const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportSettingsActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportSettingsActions.ts");
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
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const {
    createFinishExportSettingsChange,
    createStartedExportSettings,
    createStartExportSettingsChange,
} = loadExportSettingsActionsModule();

const currentExportSettings = {
    isExporting: false,
    aspectRatio: "0",
    duration: "30",
    savePath: null,
};

const startedExportSettings = createStartedExportSettings(currentExportSettings, "C:/Videos/replay.mp4");
assert.notStrictEqual(startedExportSettings, currentExportSettings);
assert.strictEqual(startedExportSettings.isExporting, true);
assert.strictEqual(startedExportSettings.aspectRatio, "0");
assert.strictEqual(startedExportSettings.duration, "30");
assert.strictEqual(startedExportSettings.savePath, "C:/Videos/replay.mp4");
assert.strictEqual(currentExportSettings.isExporting, false);
assert.strictEqual(currentExportSettings.savePath, null);

const startChange = createStartExportSettingsChange("C:/Videos/replay.mp4");
assert.strictEqual(startChange.isExporting, true);
assert.strictEqual(startChange.savePath, "C:/Videos/replay.mp4");

const finishChange = createFinishExportSettingsChange();
assert.strictEqual(finishChange.isExporting, false);
