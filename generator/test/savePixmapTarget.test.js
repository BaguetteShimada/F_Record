const assert = require("assert");
const {
    ensureSavePixmapTargetDirectory,
    getSavePixmapTargetDirectory,
} = require("../src/savePixmapTarget");

const filePath = "C:\\Users\\Admin\\F_Record\\processImages\\000001.jpg";

assert.strictEqual(
    getSavePixmapTargetDirectory(filePath),
    "C:\\Users\\Admin\\F_Record\\processImages",
);

const ensuredDirectories = [];
const targetDirectory = ensureSavePixmapTargetDirectory(filePath, directoryPath => {
    ensuredDirectories.push(directoryPath);
});

assert.strictEqual(targetDirectory, "C:\\Users\\Admin\\F_Record\\processImages");
assert.deepStrictEqual(ensuredDirectories, ["C:\\Users\\Admin\\F_Record\\processImages"]);
