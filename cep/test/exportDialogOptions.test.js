const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportDialogOptionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportDialogOptions.ts");
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

const { ASPECT_RATIO_OPTIONS } = loadExportDialogOptionsModule();

assert.strictEqual(ASPECT_RATIO_OPTIONS.map((option) => option.key).join(","), "1.7778,1.3333,1,0.75,0.5625,0");
assert.strictEqual(ASPECT_RATIO_OPTIONS.slice(0, 5).map((option) => option.label).join(","), "16:9,4:3,1:1,3:4,9:16");
assert.strictEqual(ASPECT_RATIO_OPTIONS[5].labelKey, "match canvas");
