const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportVideoActionsModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportVideoActions.ts");
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
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const { openExportedVideo } = loadExportVideoActionsModule();

const openedPaths = [];
const errors = [];
openExportedVideo(
    "C:/Videos/Sketch.mp4",
    (error) => errors.push(error),
    (targetPath) => openedPaths.push(targetPath),
);

assert.deepStrictEqual(openedPaths, ["C:/Videos/Sketch.mp4"]);
assert.deepStrictEqual(errors, []);

const expectedError = new Error("Cannot open video");
openExportedVideo(
    "C:/Videos/Sketch.mp4",
    (error) => errors.push(error),
    () => {
        throw expectedError;
    },
);

assert.deepStrictEqual(errors, [expectedError]);
