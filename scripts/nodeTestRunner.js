const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function runListedNodeTests(options) {
    const testDir = options.testDir;
    const testFiles = options.testFiles;

    assertNoDuplicateTestFiles(testFiles);
    assertAllTestFilesListed(testDir, testFiles);

    for (const testFile of testFiles) {
        runNodeTest(testDir, testFile);
    }
}

function assertNoDuplicateTestFiles(testFiles) {
    const duplicateTestFiles = testFiles.filter((testFile, index) => testFiles.indexOf(testFile) !== index);
    if (duplicateTestFiles.length > 0) {
        console.error(`Duplicate test files in runner: ${duplicateTestFiles.join(", ")}`);
        process.exit(1);
    }
}

function assertAllTestFilesListed(testDir, testFiles) {
    const listedTestFiles = new Set(testFiles);
    const unlistedTestFiles = fs.readdirSync(testDir)
        .filter(testFile => testFile.endsWith(".test.js"))
        .filter(testFile => !listedTestFiles.has(testFile))
        .sort();
    if (unlistedTestFiles.length > 0) {
        console.error(`Test files missing from runner: ${unlistedTestFiles.join(", ")}`);
        process.exit(1);
    }
}

function runNodeTest(testDir, testFile) {
    const testFilePath = path.join(testDir, testFile);
    if (!fs.existsSync(testFilePath)) {
        console.error(`Missing test file: ${testFile}`);
        process.exit(1);
    }

    const result = spawnSync(process.execPath, [testFilePath], {
        stdio: "inherit",
    });

    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

module.exports = {
    runListedNodeTests,
};
