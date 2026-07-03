const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadRecordToggleModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "recordToggle.ts");
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

const { getRecordToggleLabel } = loadRecordToggleModule();

assert.strictEqual(getRecordToggleLabel(true, {
    enabled: "Enabled",
    disabled: "Disabled",
}), "Enabled");

assert.strictEqual(getRecordToggleLabel(false, {
    enabled: "开启",
    disabled: "关闭",
}), "关闭");
