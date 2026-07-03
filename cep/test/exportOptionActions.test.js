const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportOptionActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportOptionActions.ts");
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

const { applyExportStringOptionChange } = loadExportOptionActionsModule();

const changes = [];
applyExportStringOptionChange("aspectRatio", 1.7778, (change) => {
    changes.push(change);
});
applyExportStringOptionChange("duration", 180, (change) => {
    changes.push(change);
});

assert.strictEqual(changes.length, 2);
assert.strictEqual(changes[0].aspectRatio, "1.7778");
assert.strictEqual(changes[1].duration, "180");
