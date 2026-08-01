const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadI18nModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "i18n.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
            esModuleInterop: true,
        },
    });

    const module = { exports: {} };
    const fakeI18n = {
        use() {
            return fakeI18n;
        },
        init() {
            return fakeI18n;
        },
    };
    const context = {
        module,
        exports: module.exports,
        require(request) {
            if (request === "i18next") {
                return { __esModule: true, default: fakeI18n };
            }
            if (request === "react-i18next") {
                return { initReactI18next: {} };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const { resources } = loadI18nModule();
const englishKeys = Object.keys(resources.en.translation).sort();
const chineseKeys = Object.keys(resources.cn.translation).sort();

assert.deepStrictEqual(chineseKeys, englishKeys);
assert.strictEqual(resources.en.translation["Select Export Path"], "Select Export Path");
assert.strictEqual(resources.cn.translation["Select Export Path"], "选择导出路径");
