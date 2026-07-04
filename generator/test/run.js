const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const testFiles = [
    "recordingLogic.test.js",
    "recordingEventService.test.js",
    "pixmapSettings.test.js",
    "pixmapRequestOptions.test.js",
    "pixmapService.test.js",
    "savePixmapSettings.test.js",
    "savePixmapValidation.test.js",
    "savePixmapBuffer.test.js",
    "savePixmapPixel.test.js",
    "savePixmapCopy.test.js",
    "savePixmapImage.test.js",
    "savePixmapWriter.test.js",
    "savePixmapTarget.test.js",
    "captureFramePaths.test.js",
    "captureFrameResult.test.js",
    "captureService.test.js",
    "configStore.test.js",
    "paths.test.js",
    "models.test.js",
    "timeSpentEligibility.test.js",
    "timeSpentService.test.js",
    "documentStore.test.js",
    "storage.test.js",
    "captureGate.test.js",
    "mutex.test.js",
    "pollingTask.test.js",
    "runtimePollingTasks.test.js",
    "runtimePollingService.test.js",
    "documentState.test.js",
    "documentSettingsService.test.js",
    "documentSyncService.test.js",
    "logger.test.js",
    "runtime.test.js",
];

const duplicateTestFiles = testFiles.filter((testFile, index) => testFiles.indexOf(testFile) !== index);
if (duplicateTestFiles.length > 0) {
    console.error(`Duplicate test files in runner: ${duplicateTestFiles.join(", ")}`);
    process.exit(1);
}

const listedTestFiles = new Set(testFiles);
const unlistedTestFiles = fs.readdirSync(__dirname)
    .filter(testFile => testFile.endsWith(".test.js"))
    .filter(testFile => !listedTestFiles.has(testFile))
    .sort();
if (unlistedTestFiles.length > 0) {
    console.error(`Test files missing from runner: ${unlistedTestFiles.join(", ")}`);
    process.exit(1);
}

for (const testFile of testFiles) {
    const testFilePath = path.join(__dirname, testFile);
    if (!fs.existsSync(testFilePath)) {
        console.error(`Missing test file: ${testFile}`);
        process.exit(1);
    }

    const result = spawnSync(process.execPath, [testFilePath], {
        stdio: "inherit",
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}
