const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportSaveDialogModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportSaveDialog.ts");
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

const { selectExportSavePath } = loadExportSaveDialogModule();

const dialogCalls = [];
const savePath = selectExportSavePath("Sketch.psd", "Select Export Path", {
    showSaveDialogEx(title, initialPath, fileTypes, defaultName, friendlyFilePrefix) {
        dialogCalls.push({ title, initialPath, fileTypes, defaultName, friendlyFilePrefix });
        return { err: 0, data: "C:/Videos/Sketch.mp4" };
    },
});

assert.strictEqual(savePath, "C:/Videos/Sketch.mp4");
assert.strictEqual(dialogCalls.length, 1);
assert.strictEqual(dialogCalls[0].title, "Select Export Path");
assert.strictEqual(dialogCalls[0].initialPath, "");
assert.strictEqual(dialogCalls[0].fileTypes.join(","), "mp4");
assert.strictEqual(dialogCalls[0].defaultName, "Sketch.psd.mp4");
assert.strictEqual(dialogCalls[0].friendlyFilePrefix, "MP4 (*.mp4)");

assert.strictEqual(selectExportSavePath(null, "Select Export Path", {
    showSaveDialogEx(title, initialPath, fileTypes, defaultName) {
        assert.strictEqual(defaultName, ".mp4");
        return { err: 0, data: "" };
    },
}), null);

assert.strictEqual(selectExportSavePath("Sketch.psd", "Select Export Path", {
    showSaveDialogEx() {
        return { err: 1, data: "C:/Videos/Ignored.mp4" };
    },
}), null);
