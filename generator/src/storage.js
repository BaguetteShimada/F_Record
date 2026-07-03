const fs = require("fs");
const writeFileAtomic = require("write-file-atomic");

function pathExists(targetPath, fsImpl) {
    return (fsImpl || fs).existsSync(targetPath);
}

function ensureDirectory(directoryPath) {
    if (!pathExists(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}

function readJsonFile(filePath, options) {
    const fsImpl = options && options.fs ? options.fs : fs;
    const retryDelays = options && options.retryDelays ? options.retryDelays : [20, 50];
    const sleepSyncFn = options && options.sleepSync ? options.sleepSync : sleepSync;

    if (!pathExists(filePath, fsImpl)) {
        return null;
    }

    for (let i = 0; i <= retryDelays.length; i++) {
        try {
            return JSON.parse(fsImpl.readFileSync(filePath, "utf-8"));
        } catch (error) {
            if (!shouldRetryReadJsonError(error) || i === retryDelays.length) {
                return null;
            }
            sleepSyncFn(retryDelays[i]);
        }
    }

    return null;
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

function shouldRetryReadJsonError(error) {
    if (error instanceof SyntaxError) {
        return true;
    }
    return Boolean(error && ["EPERM", "EACCES", "EBUSY"].includes(error.code));
}

module.exports = {
    pathExists,
    ensureDirectory,
    readJsonFile,
    shouldRetryReadJsonError,
    writeJsonFileAtomic,
    writeFileAtomicSyncWithRetry,
};
