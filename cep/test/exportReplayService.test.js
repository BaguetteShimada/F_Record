const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExportReplayServiceModule(storageOverrides = {}) {
    const modulePath = path.join(__dirname, "..", "src", "panel", "exportReplayService.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
            esModuleInterop: true,
        },
    });

    const storage = {
        ensureDirectory: () => {},
        pathExists: () => true,
        readDirectory: () => [],
        removeDirectoryIfExists: () => {},
        ...storageOverrides,
    };

    const module = { exports: {} };
    const context = {
        Error,
        Promise,
        encodeURIComponent,
        module,
        exports: module.exports,
        require: request => {
            if (request === "path-browserify") {
                return path;
            }
            if (request === "./constants") {
                return {
                    exportTempFolderPath: "export-temp",
                    finalJPGPath: path.join("export-temp", "finalJPG.jpg"),
                };
            }
            if (request === "./storage") {
                return storage;
            }
            if (request === "./exportErrors") {
                return {
                    createExportError: (code, message) => {
                        const error = new Error(message);
                        error.code = code;
                        return error;
                    },
                };
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

function createValidInputs(overrides = {}) {
    return {
        configData: {
            processImageFolderPath: "C:\\recordings",
            ...(overrides.configData ?? {}),
        },
        documentValue: {
            id: "document-id",
            createTime: "2026-07-04-010203",
            bounds: { left: 0, top: 0, right: 1920, bottom: 1080 },
            count: 12,
            ...(overrides.documentValue ?? {}),
        },
        exportSettings: {
            savePath: "C:\\videos\\replay.mp4",
            ...(overrides.exportSettings ?? {}),
        },
    };
}

function assertPreflightError(overrides, expectedCode, storageOverrides = {}) {
    const { validateExportReplayPreflight } = loadExportReplayServiceModule(storageOverrides);
    const { configData, documentValue, exportSettings } = createValidInputs(overrides);
    assert.throws(
        () => validateExportReplayPreflight(configData, documentValue, exportSettings),
        error => error.code === expectedCode,
    );
}

const readDirectories = [];
const { validateExportReplayPreflight } = loadExportReplayServiceModule({
    pathExists: folderPath => folderPath.endsWith(path.join("recordings", "2026-07-04-010203")),
    readDirectory: folderPath => {
        readDirectories.push(folderPath);
        return ["10.jpg", "note.txt", "2.JPG", "001.jpeg", "preview.png"];
    },
});
const successInputs = createValidInputs();
assert.deepStrictEqual(
    normalize(validateExportReplayPreflight(
        successInputs.configData,
        successInputs.documentValue,
        successInputs.exportSettings,
    )),
    {
        imageFolderPath: path.join("C:\\recordings", "2026-07-04-010203"),
        imageFiles: ["001.jpeg", "2.JPG", "10.jpg"],
    },
);
assert.deepStrictEqual(readDirectories, [path.join("C:\\recordings", "2026-07-04-010203")]);

assertPreflightError({ documentValue: { id: null } }, "NO_ACTIVE_DOCUMENT");
assertPreflightError({ documentValue: { createTime: null } }, "NO_ACTIVE_DOCUMENT");
assertPreflightError({ documentValue: { bounds: null } }, "DOCUMENT_BOUNDS_UNAVAILABLE");
assertPreflightError({ documentValue: { count: 0 } }, "NO_RECORDED_IMAGES");
assertPreflightError({ exportSettings: { savePath: "   " } }, "EXPORT_SAVE_PATH_EMPTY");
assertPreflightError({ configData: { processImageFolderPath: "   " } }, "PROCESS_IMAGE_FOLDER_EMPTY");
assertPreflightError(
    {},
    "RECORDED_IMAGE_FOLDER_MISSING",
    { pathExists: () => false },
);
assertPreflightError(
    {},
    "EXPORT_IMAGE_FILES_EMPTY",
    { readDirectory: () => ["preview.png", "note.txt"] },
);
