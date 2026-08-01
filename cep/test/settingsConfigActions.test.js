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
        require(request) {
            if (request === "./models") {
                return {
                    normalizeResolution: value => ["360", "720", "1080", "1440"].includes(value) ? value : "1080",
                    normalizeQuality: value => ["20", "70", "90"].includes(value) ? value : "70",
                    normalizeIdleTimeout: value => ["0", "1", "5", "10", "30"].includes(value) ? value : "1",
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
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

applySettingsStringConfigChange("resolution", "bad", (configChange) => {
    configChanges.push(configChange);
});
applySettingsStringConfigChange("quality", "100", (configChange) => {
    configChanges.push(configChange);
});
applySettingsStringConfigChange("idleTimeout", "NaN", (configChange) => {
    configChanges.push(configChange);
});

assert.strictEqual(configChanges[3].resolution, "1080");
assert.strictEqual(configChanges[4].quality, "70");
assert.strictEqual(configChanges[5].idleTimeout, "1");
