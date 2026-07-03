const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadSettingsLanguageActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "settingsLanguageActions.ts");
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

const { applyLanguageChange } = loadSettingsLanguageActionsModule();

const changedLanguages = [];
const configChanges = [];

applyLanguageChange(
    "en",
    {
        changeLanguage(language) {
            changedLanguages.push(language);
        },
    },
    (configChange) => configChanges.push(configChange),
);

assert.deepStrictEqual(changedLanguages, ["en"]);
assert.strictEqual(configChanges.length, 1);
assert.strictEqual(configChanges[0].language, "en");
