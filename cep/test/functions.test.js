const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadFunctionsScript() {
    const scriptPath = path.join(__dirname, "..", "src", "js", "functions.js");
    const source = fs.readFileSync(scriptPath, "utf8");
    const evalScripts = [];
    const context = {
        __dirname: path.dirname(scriptPath),
        encodeURIComponent,
        process: {
            platform: "win32",
            env: {
                USERPROFILE: "C:\\Users\\Admin",
            },
        },
        require: request => {
            if (request === "fs") {
                return {
                    existsSync: () => true,
                    mkdirSync: () => {},
                    readFileSync: () => "",
                    readdirSync: () => [],
                    rmSync: () => {},
                    unlinkSync: () => {},
                };
            }
            if (request === "path") {
                return path;
            }
            if (request === "write-file-atomic") {
                return { sync: () => {} };
            }
            if (request.endsWith("localPathOpener.js")) {
                return { openLocalPathWithExecFile: () => {} };
            }
            if (request.endsWith("exportReplayWorker.js")) {
                return { runExportReplayWorker: () => {} };
            }
            if (request.endsWith("exportReplayUtils.js")) {
                return { resolveExportBinaries: () => {} };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
        CSInterface: function CSInterface() {
            return {
                evalScript: script => evalScripts.push(script),
                getExtensionID: () => "com.f_know.f_record.cep",
                getApplicationID: () => "PHXS",
                dispatchEvent: () => {},
            };
        },
        CSEvent: function CSEvent() {},
    };

    vm.runInNewContext(source, context, { filename: scriptPath });
    return { context, evalScripts };
}

const { context, evalScripts } = loadFunctionsScript();
function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

assert.strictEqual(
    context.encodeExtendScriptStringArgument("C:\\Users\\O'Neil\\F Record (test)\\final!.jpg"),
    "C%3A%5CUsers%5CO%27Neil%5CF%20Record%20%28test%29%5Cfinal%21.jpg",
);

const error = new Error("Export failed");
error.detail = "C:\\Users\\O'Neil\\F Record (test)\\final!.jpg";
const script = context.createShowErrorScript(error);

assert.deepStrictEqual(
    normalize(context.serializeErrorDetails("plain failure")),
    { name: "Error", message: "plain failure" },
);
assert.deepStrictEqual(
    normalize(context.serializeErrorDetails(null)),
    { name: "Error", message: "null" },
);
assert.deepStrictEqual(
    normalize(context.serializeErrorDetails({ reason: "unknown" })),
    { reason: "unknown" },
);

assert.ok(script.startsWith("$.f_record.showError('"));
assert.ok(script.endsWith("')"));
assert.strictEqual(script.includes("O'Neil"), false);
assert.ok(script.includes("O%27Neil"));
assert.ok(script.includes("final%21.jpg"));

context.showError(error);
assert.deepStrictEqual(evalScripts, [script]);
