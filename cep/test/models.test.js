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

const { createDefaultExportProgress } = loadModelsModule();

const firstProgress = createDefaultExportProgress();
const secondProgress = createDefaultExportProgress();

assert.notStrictEqual(firstProgress, secondProgress);
assert.strictEqual(firstProgress.status, "");
assert.strictEqual(firstProgress.percent, 0);
