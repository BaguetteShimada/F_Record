const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function listReplayImageFiles(imageFolderPath, fsImpl = fs) {
    const files = fsImpl.readdirSync(imageFolderPath);
    return files
        .filter(file => /\.(jpg|jpeg)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function checkJPGIntegrity(filePath, fsImpl = fs) {
    try {
        const buffer = fsImpl.readFileSync(filePath);
        if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
            return false;
        }
        if (buffer[buffer.length - 2] !== 0xFF || buffer[buffer.length - 1] !== 0xD9) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

function copyValidReplayImages(imageFolderPath, imageFiles, exportTempFolderPath, options = {}) {
    const fsImpl = options.fs || fs;
    const pathImpl = options.path || path;
    let copiedCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (typeof options.onFile === "function") {
            options.onFile(file, i);
        }
        const src = pathImpl.join(imageFolderPath, file);
        if (!checkJPGIntegrity(src, fsImpl)) {
            continue;
        }
        copiedCount += 1;
        const newName = `${copiedCount.toString().padStart(6, '0')}.jpg`;
        const dest = pathImpl.join(exportTempFolderPath, newName);
        fsImpl.copyFileSync(src, dest);
    }

    return copiedCount;
}

function calculateExportVideoSize(configData, documentValue, exportSettings) {
    let aspectRatio = parseFloat(exportSettings.aspectRatio);
    if (aspectRatio === 0.0) {
        aspectRatio = (documentValue.bounds.right - documentValue.bounds.left) /
            (documentValue.bounds.bottom - documentValue.bounds.top);
    }
    let height = parseFloat(configData.resolution) * Math.sqrt(16 / 9 / aspectRatio);
    let width = height * aspectRatio;
    height = Math.max(Math.round(height / 2), 1) * 2;
    width = Math.max(Math.round(width / 2), 1) * 2;
    return { width, height };
}

function calculateExportProgress(statusInfo, index, percent) {
    const clampedPercent = Math.min(Math.max(percent, 0), 1);
    let nowPercent = 0;
    for (let i = 0; i < index; i++) {
        nowPercent += statusInfo[i].ratio;
    }
    nowPercent += statusInfo[index].ratio * clampedPercent;
    return {
        status: statusInfo[index].status,
        percent: Math.ceil(nowPercent * 100),
    };
}

function serializeError(error) {
    if (error instanceof Error) {
        const serialized = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
        Object.getOwnPropertyNames(error).forEach((key) => {
            serialized[key] = error[key];
        });
        return serialized;
    }
    if (error && typeof error === "object") {
        const serialized = {};
        Object.getOwnPropertyNames(error).forEach((key) => {
            serialized[key] = error[key];
        });
        if (typeof serialized.message !== "string") {
            serialized.message = "Export worker failed";
        }
        return serialized;
    }
    return {
        name: "Error",
        message: String(error),
    };
}

function resolveExportBinaries(options = {}) {
    const env = options.env || process.env;
    const fsImpl = options.fs || fs;
    const execFileSyncFn = options.execFileSync || execFileSync;
    const platform = options.platform || process.platform;
    return {
        ffmpeg: resolveExportBinary({
            displayName: "ffmpeg",
            envNames: ["F_RECORD_FFMPEG_PATH", "FFMPEG_PATH"],
            commandName: "ffmpeg",
            env,
            execFileSync: execFileSyncFn,
            fs: fsImpl,
            platform,
        }),
        ffprobe: resolveExportBinary({
            displayName: "ffprobe",
            envNames: ["F_RECORD_FFPROBE_PATH", "FFPROBE_PATH"],
            commandName: "ffprobe",
            env,
            execFileSync: execFileSyncFn,
            fs: fsImpl,
            platform,
        }),
    };
}

function resolveExportBinary(options) {
    const envPath = readEnvPath(options.envNames, options.env);
    if (envPath !== null) {
        if (isFile(envPath, options.fs)) {
            return envPath;
        }
        throw createMissingExportBinaryError(options.displayName, envPath);
    }

    const pathCandidates = findCommandInPath(options.commandName, options.platform, options.execFileSync);
    for (let i = 0; i < pathCandidates.length; i++) {
        const candidate = pathCandidates[i];
        if (isFile(candidate, options.fs)) {
            return candidate;
        }
    }

    throw createMissingExportBinaryError(options.displayName, options.commandName);
}

function readEnvPath(envNames, env) {
    for (let i = 0; i < envNames.length; i++) {
        const value = env[envNames[i]];
        if (typeof value === "string" && value.trim() !== "") {
            return normalizeEnvPath(value);
        }
    }
    return null;
}

function normalizeEnvPath(value) {
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
            return trimmed.slice(1, -1).trim();
        }
    }
    return trimmed;
}

function findCommandInPath(commandName, platform, execFileSyncFn) {
    const lookupCommand = platform === "win32" ? "where" : "which";
    try {
        return execFileSyncFn(lookupCommand, [commandName], { encoding: "utf8" })
            .split(/\r?\n/)
            .map(value => value.trim())
            .filter(Boolean);
    } catch (error) {
        return [];
    }
}

function createMissingExportBinaryError(name, source) {
    const error = new Error(
        `Missing export binary: ${name} (${source}). Install ffmpeg and make sure it is available in PATH, or set F_RECORD_FFMPEG_PATH and F_RECORD_FFPROBE_PATH.`,
    );
    error.code = "MISSING_EXPORT_BINARY";
    error.binaryName = name;
    error.binarySource = source;
    return error;
}

function createExportError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function isFile(filePath, fsImpl) {
    try {
        return fsImpl.statSync(filePath).isFile();
    } catch (error) {
        return false;
    }
}

module.exports = {
    calculateExportProgress,
    calculateExportVideoSize,
    checkJPGIntegrity,
    copyValidReplayImages,
    createExportError,
    listReplayImageFiles,
    resolveExportBinaries,
    serializeError,
};
