const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadDocumentFolderActionsModule(getProcessImageFolderPath) {
    const modulePath = path.join(__dirname, "..", "src", "panel", "documentFolderActions.ts");
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
        openLocalPath() {
            throw new Error("Default opener should not be used in tests");
        },
        require(request) {
            if (request === "./documentPaths") {
                return { getProcessImageFolderPath };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const pathCalls = [];
const { openCurrentDocumentProcessImageFolder } = loadDocumentFolderActionsModule((root, createTime) => {
    pathCalls.push({ root, createTime });
    return `${root}/${createTime}`;
});

const openedPaths = [];
const errors = [];
openCurrentDocumentProcessImageFolder(
    { processImageFolderPath: "C:/F_Record/processImages" },
    { createTime: "20260704" },
    (error) => errors.push(error),
    (targetPath) => openedPaths.push(targetPath),
);

assert.deepStrictEqual(pathCalls, [{
    root: "C:/F_Record/processImages",
    createTime: "20260704",
}]);
assert.deepStrictEqual(openedPaths, ["C:/F_Record/processImages/20260704"]);
assert.deepStrictEqual(errors, []);

const expectedError = new Error("Cannot open folder");
openCurrentDocumentProcessImageFolder(
    { processImageFolderPath: "C:/F_Record/processImages" },
    { createTime: null },
    (error) => errors.push(error),
    () => {
        throw expectedError;
    },
);

assert.deepStrictEqual(errors, [expectedError]);
