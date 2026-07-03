const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadTimeFormattingModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "timeFormatting.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
        },
    });

    const module = { exports: {} };
    const context = {
        Math,
        module,
        exports: module.exports,
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const { formatElapsedTime } = loadTimeFormattingModule();
const englishLabels = { hours: "h", minutes: "m", seconds: "s" };
const chineseLabels = { hours: "时", minutes: "分", seconds: "秒" };

assert.strictEqual(formatElapsedTime(null, englishLabels), "0s");
assert.strictEqual(formatElapsedTime(undefined, englishLabels), "0s");
assert.strictEqual(formatElapsedTime(-1, englishLabels), "0s");
assert.strictEqual(formatElapsedTime(12.9, englishLabels), "12s");
assert.strictEqual(formatElapsedTime(60, englishLabels), "1m 0s");
assert.strictEqual(formatElapsedTime(125, englishLabels), "2m 5s");
assert.strictEqual(formatElapsedTime(3600, englishLabels), "1h 0m");
assert.strictEqual(formatElapsedTime(3661, englishLabels), "1h 1m");
assert.strictEqual(formatElapsedTime(7325, chineseLabels), "2时 2分");
