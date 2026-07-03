const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadPollingModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "polling.ts");
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

const { PANEL_SYNC_POLL_INTERVAL_MS, startPanelPolling } = loadPollingModule();

assert.strictEqual(PANEL_SYNC_POLL_INTERVAL_MS, 500);

const intervals = [];
const clearedIntervals = [];
const timerWindow = {
    setInterval(callback, delayMs) {
        intervals.push({ callback, delayMs });
        return 42;
    },
    clearInterval(intervalId) {
        clearedIntervals.push(intervalId);
    },
};

let callCount = 0;
const stopPolling = startPanelPolling(() => {
    callCount += 1;
}, timerWindow, 250);

assert.strictEqual(callCount, 1);
assert.strictEqual(intervals.length, 1);
assert.strictEqual(intervals[0].delayMs, 250);

intervals[0].callback();
assert.strictEqual(callCount, 2);

stopPolling();
assert.deepStrictEqual(clearedIntervals, [42]);
