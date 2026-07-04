const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const testFiles = [
    "exportReplayUtils.test.js",
    "exportReplayWorker.test.js",
    "storage.test.js",
    "localPathOpener.test.js",
    "toastContainer.test.js",
    "models.test.js",
    "exportErrors.test.js",
    "exportDurationOptions.test.js",
    "exportReplayService.test.js",
    "exportReplayFlow.test.js",
    "exportReplayConfirmAction.test.js",
    "exportSaveDialog.test.js",
    "exportStartActions.test.js",
    "exportAvailability.test.js",
    "exportVideoActions.test.js",
    "exportErrorDetailsActions.test.js",
    "exportNotifications.test.js",
    "exportSettingsActions.test.js",
    "exportDialogOptions.test.js",
    "exportOptionActions.test.js",
    "timeFormatting.test.js",
    "polling.test.js",
    "externalLinks.test.js",
    "dashboardValues.test.js",
    "documentPaths.test.js",
    "documentFolderActions.test.js",
    "settingsFolderActions.test.js",
    "settingsLanguageActions.test.js",
    "settingsConfigActions.test.js",
    "settingsOptions.test.js",
    "recordToggle.test.js",
    "noBlockingAlerts.test.js",
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
