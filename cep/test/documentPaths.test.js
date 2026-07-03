const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadDocumentPathsModule(join) {
    const modulePath = path.join(__dirname, "..", "src", "panel", "documentPaths.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
            esModuleInterop: true,
        },
    });

    const module = { exports: {} };
    const context = {
        module,
        exports: module.exports,
        require(request) {
            if (request === "path-browserify") {
                return { __esModule: true, default: { join } };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const joins = [];
const { getProcessImageFolderPath } = loadDocumentPathsModule((root, child) => {
    joins.push([root, child]);
    return `${root}/${child}`;
});

assert.strictEqual(getProcessImageFolderPath("C:/F_Record/processImages", "20260704"), "C:/F_Record/processImages/20260704");
assert.strictEqual(getProcessImageFolderPath("C:/F_Record/processImages", null), "C:/F_Record/processImages/");
assert.strictEqual(getProcessImageFolderPath("C:/F_Record/processImages", undefined), "C:/F_Record/processImages/");
assert.deepStrictEqual(joins, [
    ["C:/F_Record/processImages", "20260704"],
    ["C:/F_Record/processImages", ""],
    ["C:/F_Record/processImages", ""],
]);
