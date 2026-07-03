const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadSettingsConfigActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "settingsConfigActions.ts");
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

const { applySettingsStringConfigChange } = loadSettingsConfigActionsModule();

const configChanges = [];
applySettingsStringConfigChange("resolution", 1440, (configChange) => {
    configChanges.push(configChange);
});
applySettingsStringConfigChange("quality", "90", (configChange) => {
    configChanges.push(configChange);
});
applySettingsStringConfigChange("idleTimeout", 0, (configChange) => {
    configChanges.push(configChange);
});

assert.strictEqual(configChanges.length, 3);
assert.strictEqual(configChanges[0].resolution, "1440");
assert.strictEqual(configChanges[1].quality, "90");
assert.strictEqual(configChanges[2].idleTimeout, "0");
