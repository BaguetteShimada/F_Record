const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportReplayFlowModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportReplayFlow.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
        },
    });

    const module = { exports: {} };
    const context = {
        Promise,
        module,
        exports: module.exports,
        require(request) {
            if (request === "./exportReplayService") {
                return {
                    prepareExportReplayParams() {
                        throw new Error("Default prepare should not be used in tests");
                    },
                    runPreparedExportReplay() {
                        throw new Error("Default run should not be used in tests");
                    },
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

(async () => {
    const { runExportReplayFlow } = loadExportReplayFlowModule();

    const configData = { processImageFolderPath: "C:/recordings" };
    const documentValue = { id: 1, createTime: "20260704", count: 3 };
    const exportSettings = { savePath: "C:/videos/replay.mp4" };
    const exportParams = { configData, documentValue, exportSettings, exportTempFolderPath: "C:/temp" };
    const calls = [];
    const progressValues = [];

    await runExportReplayFlow(
        configData,
        documentValue,
        exportSettings,
        (progress) => progressValues.push(progress),
        {
            prepareExportReplayParams(...args) {
                calls.push({ method: "prepare", args });
                return Promise.resolve(exportParams);
            },
            runPreparedExportReplay(params, onProgress) {
                calls.push({ method: "run", params });
                onProgress({ status: "Exporting", percent: 50 });
                return Promise.resolve();
            },
        },
    );

    assert.strictEqual(calls.length, 2);
    assert.strictEqual(calls[0].method, "prepare");
    assert.deepStrictEqual(calls[0].args, [configData, documentValue, exportSettings]);
    assert.deepStrictEqual(calls[1], { method: "run", params: exportParams });
    assert.deepStrictEqual(progressValues, [{ status: "Exporting", percent: 50 }]);

    const expectedError = new Error("prepare failed");
    await assert.rejects(
        () => runExportReplayFlow(
            configData,
            documentValue,
            exportSettings,
            () => {},
            {
                prepareExportReplayParams() {
                    return Promise.reject(expectedError);
                },
                runPreparedExportReplay() {
                    throw new Error("Run should not be called");
                },
            },
        ),
        expectedError,
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
