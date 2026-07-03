const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportNotificationsModule(getExportFailureMessageDescriptor) {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportNotifications.ts");
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
            if (request === "./exportErrors") {
                return { getExportFailureMessageDescriptor };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const toastCalls = [];
const toastQueue = {
    info(message, options) {
        toastCalls.push({ method: "info", message, options });
    },
    positive(message, options) {
        toastCalls.push({ method: "positive", message, options });
    },
    negative(message, options) {
        toastCalls.push({ method: "negative", message, options });
    },
};
const translations = [];
const t = (key, values) => {
    translations.push({ key, values });
    return values === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(values)}`;
};

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

const {
    showExportStartedToast,
    showExportSuccessToast,
    showExportFailureToast,
} = loadExportNotificationsModule((error) => error.descriptor);

showExportStartedToast(t, toastQueue);
assert.deepStrictEqual(normalize(toastCalls[0]), {
    method: "info",
    message: "t:Start to export",
    options: { timeout: 5000 },
});

let didOpen = false;
showExportSuccessToast(t, toastQueue, () => {
    didOpen = true;
});
assert.strictEqual(toastCalls[1].method, "positive");
assert.strictEqual(toastCalls[1].message, "t:Export success");
assert.strictEqual(toastCalls[1].options.actionLabel, "t:Open");
toastCalls[1].options.onAction();
assert.strictEqual(didOpen, true);

let didShowDetails = false;
showExportFailureToast(
    { descriptor: { key: "Export binary missing", values: { binaryName: "ffmpeg" } } },
    t,
    toastQueue,
    () => {
        didShowDetails = true;
    },
);
assert.strictEqual(toastCalls[2].method, "negative");
assert.strictEqual(toastCalls[2].message, 't:Export binary missing:{"binaryName":"ffmpeg"}');
assert.strictEqual(toastCalls[2].options.actionLabel, "t:Details");
toastCalls[2].options.onAction();
assert.strictEqual(didShowDetails, true);

assert.deepStrictEqual(normalize(translations), [
    { key: "Start to export" },
    { key: "Export success" },
    { key: "Open" },
    { key: "Export binary missing", values: { binaryName: "ffmpeg" } },
    { key: "Details" },
]);
