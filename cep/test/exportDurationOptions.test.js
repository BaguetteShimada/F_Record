const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportDurationOptionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportDurationOptions.ts");
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

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

const {
    estimateReplayDurationSeconds,
    getReplayDurationOptions,
    getReplayDurationPresetSeconds,
} = loadExportDurationOptionsModule();

assert.strictEqual(estimateReplayDurationSeconds(null, 25), 3);
assert.strictEqual(estimateReplayDurationSeconds(undefined, 25), 3);
assert.strictEqual(estimateReplayDurationSeconds(0, 25), 3);
assert.strictEqual(estimateReplayDurationSeconds(12, 25), 3);
assert.strictEqual(estimateReplayDurationSeconds(25, 25), 4);
assert.strictEqual(estimateReplayDurationSeconds(300, 25), 15);
assert.strictEqual(estimateReplayDurationSeconds(301, 25), 15);
assert.strictEqual(estimateReplayDurationSeconds(325, 25), 16);

assert.deepStrictEqual(
    normalize(getReplayDurationPresetSeconds(300, 25)),
    [],
);
assert.deepStrictEqual(
    normalize(getReplayDurationPresetSeconds(325, 25)),
    [15],
);
assert.deepStrictEqual(
    normalize(getReplayDurationPresetSeconds(1500, 25)),
    [15, 30, 60],
);
assert.deepStrictEqual(
    normalize(getReplayDurationPresetSeconds(4425, 25)),
    [15, 30, 60],
);
assert.deepStrictEqual(
    normalize(getReplayDurationPresetSeconds(4450, 25)),
    [15, 30, 60, 180],
);

assert.deepStrictEqual(
    normalize(getReplayDurationOptions(300, 25)),
    [{
        key: "0",
        durationSeconds: 15,
        isOriginal: true,
    }],
);
assert.deepStrictEqual(
    normalize(getReplayDurationOptions(1500, 25)),
    [
        { key: "15", durationSeconds: 15, isOriginal: false },
        { key: "30", durationSeconds: 30, isOriginal: false },
        { key: "60", durationSeconds: 60, isOriginal: false },
        { key: "0", durationSeconds: 63, isOriginal: true },
    ],
);
