const fs = require("fs");
const writeFileAtomic = require("write-file-atomic");

function pathExists(targetPath) {
    return fs.existsSync(targetPath);
}

function ensureDirectory(directoryPath) {
    if (!pathExists(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}

function readJsonFile(filePath) {
    if (!pathExists(filePath)) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
        return null;
    }
}

function writeJsonFileAtomic(filePath, value) {
    writeFileAtomicSyncWithRetry(filePath, JSON.stringify(value, null, 2));
}

function writeFileAtomicSyncWithRetry(filePath, data) {
    const delays = [20, 50, 100, 200, 500];
    let lastError = null;
    for (let i = 0; i <= delays.length; i++) {
        try {
            writeFileAtomic.sync(filePath, data);
            return;
        } catch (error) {
            lastError = error;
            if (!error || !["EPERM", "EACCES", "EBUSY"].includes(error.code) || i === delays.length) {
                break;
            }
            sleepSync(delays[i]);
        }
    }
    throw lastError;
}

function sleepSync(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {}
}

module.exports = {
    pathExists,
    ensureDirectory,
    readJsonFile,
    writeJsonFileAtomic,
    writeFileAtomicSyncWithRetry,
};
