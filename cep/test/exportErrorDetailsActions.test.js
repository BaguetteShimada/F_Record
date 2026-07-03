const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportErrorDetailsActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportErrorDetailsActions.ts");
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
        showError() {
            throw new Error("Default details viewer should not be used in tests");
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const { showExportErrorDetails } = loadExportErrorDetailsActionsModule();

const exportError = new Error("Export failed");
const viewedErrors = [];
const handledErrors = [];
showExportErrorDetails(
    exportError,
    (error) => handledErrors.push(error),
    (error) => viewedErrors.push(error),
);

assert.deepStrictEqual(viewedErrors, [exportError]);
assert.deepStrictEqual(handledErrors, []);

const detailsError = new Error("Cannot show details");
showExportErrorDetails(
    exportError,
    (error) => handledErrors.push(error),
    () => {
        throw detailsError;
    },
);

assert.deepStrictEqual(handledErrors, [detailsError]);
