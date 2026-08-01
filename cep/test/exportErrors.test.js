const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportErrorsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportErrors.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
        },
    });

    const module = { exports: {} };
    const context = {
        Error,
        Object,
        Array,
        module,
        exports: module.exports,
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const {
    createExportError,
    getExportFailureMessageDescriptor,
} = loadExportErrorsModule();

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

assert.deepStrictEqual(
    normalize(getExportFailureMessageDescriptor(createExportError("NO_ACTIVE_DOCUMENT", "No document"))),
    { key: "Export error no active document" },
);

assert.deepStrictEqual(
    normalize(getExportFailureMessageDescriptor(createExportError("EXPORT_VALID_IMAGE_FILES_EMPTY", "No valid images"))),
    { key: "Export error image files empty" },
);

const missingBinary = new Error("missing");
missingBinary.code = "MISSING_EXPORT_BINARY";
missingBinary.binaryName = "ffmpeg";
assert.deepStrictEqual(
    normalize(getExportFailureMessageDescriptor(missingBinary)),
    { key: "Export binary missing", values: { binaryName: "ffmpeg" } },
);

const missingNode = new Error("missing node");
missingNode.code = "MISSING_NODE_RUNTIME";
assert.deepStrictEqual(
    normalize(getExportFailureMessageDescriptor(missingNode)),
    { key: "Export node runtime missing" },
);

const unknownError = new Error("unexpected");
unknownError.code = "UNEXPECTED";
assert.deepStrictEqual(
    normalize(getExportFailureMessageDescriptor(unknownError)),
    { key: "Export failed" },
);

assert.deepStrictEqual(
    normalize(getExportFailureMessageDescriptor("failed")),
    { key: "Export failed" },
);
