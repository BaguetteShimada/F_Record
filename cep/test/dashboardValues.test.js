const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadDashboardValuesModule(formatElapsedTime) {
    const modulePath = path.join(__dirname, "..", "src", "panel", "dashboardValues.ts");
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
            if (request === "./timeFormatting") {
                return { formatElapsedTime };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const formattedTimeCalls = [];
const {
    getDocumentNameDisplayValue,
    getImageCountDisplayValue,
    getTimeSpentDisplayValue,
} = loadDashboardValuesModule((seconds, labels) => {
    formattedTimeCalls.push({ seconds, labels });
    return `${seconds}${labels.seconds}`;
});

const emptyDocument = {
    id: null,
    name: "Hidden",
    count: 10,
    timeSpent: 42,
};

assert.strictEqual(getDocumentNameDisplayValue(emptyDocument), "");
assert.strictEqual(getImageCountDisplayValue(emptyDocument), "");
assert.strictEqual(getTimeSpentDisplayValue(emptyDocument, { hours: "h", minutes: "m", seconds: "s" }), "");
assert.deepStrictEqual(formattedTimeCalls, []);

const currentDocument = {
    id: 12,
    name: "Sketch.psd",
    count: 0,
    timeSpent: 42,
};

assert.strictEqual(getDocumentNameDisplayValue(currentDocument), "Sketch.psd");
assert.strictEqual(getImageCountDisplayValue(currentDocument), "0");
assert.strictEqual(getTimeSpentDisplayValue(currentDocument, { hours: "h", minutes: "m", seconds: "s" }), "42s");
assert.deepStrictEqual(formattedTimeCalls, [{
    seconds: 42,
    labels: { hours: "h", minutes: "m", seconds: "s" },
}]);
