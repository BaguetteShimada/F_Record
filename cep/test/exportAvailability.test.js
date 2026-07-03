const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportAvailabilityModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportAvailability.ts");
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

const { isExportReplayDisabled } = loadExportAvailabilityModule();

assert.strictEqual(isExportReplayDisabled({ id: 1, count: 1 }), false);
assert.strictEqual(isExportReplayDisabled({ id: null, count: 1 }), true);
assert.strictEqual(isExportReplayDisabled({ id: 1, count: null }), true);
assert.strictEqual(isExportReplayDisabled({ id: 1, count: 0 }), true);

// Preserves the previous JSX truthiness behavior.
assert.strictEqual(isExportReplayDisabled({ id: 0, count: 1 }), true);
assert.strictEqual(isExportReplayDisabled({ id: 1, count: -1 }), false);
