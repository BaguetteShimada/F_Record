const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadSettingsFolderActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "settingsFolderActions.ts");
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

const { selectProcessImageFolder } = loadSettingsFolderActionsModule();

const dialogCalls = [];
const configChanges = [];
selectProcessImageFolder(
    "C:/F_Record/processImages",
    "Select Process Image Folder",
    (configChange) => configChanges.push(configChange),
    {
        showOpenDialog(allowMultipleSelection, chooseDirectory, title, initialPath) {
            dialogCalls.push({ allowMultipleSelection, chooseDirectory, title, initialPath });
            return { err: 0, data: ["D:/Paint/processImages"] };
        },
    },
);

assert.deepStrictEqual(dialogCalls, [{
    allowMultipleSelection: false,
    chooseDirectory: true,
    title: "Select Process Image Folder",
    initialPath: "C:/F_Record/processImages",
}]);
assert.strictEqual(configChanges.length, 1);
assert.strictEqual(configChanges[0].processImageFolderPath, "D:/Paint/processImages");

selectProcessImageFolder(
    "C:/F_Record/processImages",
    "Select Process Image Folder",
    (configChange) => configChanges.push(configChange),
    {
        showOpenDialog() {
            return { err: 0, data: [] };
        },
    },
);

selectProcessImageFolder(
    "C:/F_Record/processImages",
    "Select Process Image Folder",
    (configChange) => configChanges.push(configChange),
    {
        showOpenDialog() {
            return { err: 1, data: ["E:/Ignored"] };
        },
    },
);

assert.strictEqual(configChanges.length, 1);
assert.strictEqual(configChanges[0].processImageFolderPath, "D:/Paint/processImages");
