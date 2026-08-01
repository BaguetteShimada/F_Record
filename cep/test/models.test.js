const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadModelsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "models.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
            esModuleInterop: true,
        },
    });

    const module = { exports: {} };
    const context = {
        isFinite,
        module,
        exports: module.exports,
        require(request) {
            if (request === "path-browserify") {
                return path;
            }
            if (request === "./constants") {
                return {
                    F_Record_Dir: "C:/Users/Admin/AppData/Roaming/F_Record",
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const {
    createDefaultConfigData,
    createDefaultExportProgress,
    normalizeConfigData,
    normalizeIdleTimeout,
    normalizeQuality,
    normalizeResolution,
} = loadModelsModule();

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

const firstProgress = createDefaultExportProgress();
const secondProgress = createDefaultExportProgress();

assert.notStrictEqual(firstProgress, secondProgress);
assert.strictEqual(firstProgress.status, "");
assert.strictEqual(firstProgress.percent, 0);

const fallbackConfig = {
    ...createDefaultConfigData(),
    processImageFolderPath: "C:/fallback/processImages",
};
assert.deepStrictEqual(
    normalize(normalizeConfigData({
        isEnabled: true,
        processImageFolderPath: "C:/recordings",
        resolution: "9999",
        quality: "100",
        idleTimeout: "NaN",
        language: "jp",
        lastExportTime: Number.NaN,
    }, fallbackConfig)),
    {
        ...fallbackConfig,
        isEnabled: true,
        processImageFolderPath: "C:/recordings",
    },
);
assert.strictEqual(normalizeResolution("720"), "720");
assert.strictEqual(normalizeResolution("bad"), "1080");
assert.strictEqual(normalizeQuality("90"), "90");
assert.strictEqual(normalizeQuality("bad"), "70");
assert.strictEqual(normalizeIdleTimeout("0"), "0");
assert.strictEqual(normalizeIdleTimeout("bad"), "1");
