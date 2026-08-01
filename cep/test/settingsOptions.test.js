const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadSettingsOptionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "settingsOptions.ts");
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
                    VALID_RESOLUTIONS: ["360", "720", "1080", "1440"],
                    VALID_QUALITIES: ["20", "70", "90"],
                    VALID_IDLE_TIMEOUTS: ["0", "1", "5", "10", "30"],
                    VALID_LANGUAGES: ["cn", "en"],
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const {
    IDLE_TIMEOUT_MINUTE_OPTIONS,
    LANGUAGE_OPTIONS,
    QUALITY_OPTIONS,
    RESOLUTION_OPTIONS,
} = loadSettingsOptionsModule();

assert.strictEqual(RESOLUTION_OPTIONS.join(","), "360,720,1080,1440");
assert.strictEqual(QUALITY_OPTIONS.map((option) => option.key).join(","), "20,70,90");
assert.strictEqual(QUALITY_OPTIONS.map((option) => option.labelKey).join(","), "low,medium,high");
assert.strictEqual(IDLE_TIMEOUT_MINUTE_OPTIONS.join(","), "1,5,10,30");
assert.strictEqual(LANGUAGE_OPTIONS.map((option) => option.key).join(","), "cn,en");
assert.strictEqual(LANGUAGE_OPTIONS.map((option) => option.label).join(","), "中文,English");
