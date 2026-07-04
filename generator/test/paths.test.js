const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadPathsModule(platform, env) {
    const modulePath = path.join(__dirname, "..", "src", "paths.js");
    const source = fs.readFileSync(modulePath, "utf8");
    const module = { exports: {} };
    const context = {
        module,
        exports: module.exports,
        process: { platform, env },
        require(request) {
            if (request === "path") {
                return path;
            }
            throw new Error(`Unexpected require: ${request}`);
        },
    };
    vm.runInNewContext(source, context, { filename: modulePath });
    return module.exports;
}

const windowsPaths = loadPathsModule("win32", {
    USERPROFILE: "C:\\Users\\Admin",
});
assert.strictEqual(
    windowsPaths.getUserDirectory(),
    path.join("C:\\Users\\Admin", "AppData", "Roaming"),
);
assert.strictEqual(
    windowsPaths.F_Record_Dir,
    path.join("C:\\Users\\Admin", "AppData", "Roaming", "F_Record"),
);
assert.strictEqual(
    windowsPaths.configDataFilePath,
    path.join(windowsPaths.F_Record_Dir, "configData.json"),
);
assert.strictEqual(
    windowsPaths.nowDocumentFilePath,
    path.join(windowsPaths.F_Record_Dir, "nowDocument.json"),
);
assert.strictEqual(
    windowsPaths.documentValueFolderPath,
    path.join(windowsPaths.F_Record_Dir, "documentValues"),
);
assert.strictEqual(
    windowsPaths.getDocumentValueFilePath("2026-07-04-12-00-00-000"),
    path.join(windowsPaths.documentValueFolderPath, "2026-07-04-12-00-00-000.json"),
);

const macPaths = loadPathsModule("darwin", {
    HOME: "/Users/admin",
});
assert.strictEqual(
    macPaths.getUserDirectory(),
    path.join("/Users/admin", "Library", "Application Support"),
);
assert.strictEqual(
    macPaths.F_Record_Dir,
    path.join("/Users/admin", "Library", "Application Support", "F_Record"),
);
