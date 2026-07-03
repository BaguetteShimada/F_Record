const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function runExportReplayWorker(exportParams, onProgress, options = {}) {
    const spawnFn = options.spawn || spawn;
    const workerPath = options.workerPath || path.join(options.baseDir || __dirname, 'exportReplay.js');
    const nodeCommand = options.nodeCommand || resolveNodeCommand({
        baseDir: path.dirname(workerPath),
        env: options.env,
        fs: options.fs,
        platform: options.platform,
    });

    return new Promise((resolve, reject) => {
        let settled = false;
        let worker = null;

        const resolveOnce = () => {
            if (!settled) {
                settled = true;
                cleanupWorker(worker);
                resolve();
            }
        };

        const rejectOnce = (error) => {
            if (!settled) {
                settled = true;
                cleanupWorker(worker);
                reject(error);
            }
        };

        try {
            worker = spawnFn(nodeCommand, [workerPath], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            });
        } catch (error) {
            rejectOnce(error);
            return;
        }

        worker.on('message', (message) => {
            if (!message || typeof message.type !== 'string') {
                return;
            }
            const { type, data } = message;
            switch (type) {
            case "exportReplayProgress":
                try {
                    onProgress(data);
                } catch (error) {
                    rejectOnce(error);
                }
                break;
            case "exportReplaySuccess":
                resolveOnce();
                break;
            case "exportReplayError":
                rejectOnce(toWorkerError(data));
                break;
            }
        });

        worker.on('error', (error) => {
            rejectOnce(error);
        });

        worker.on('exit', (code, signal) => {
            if (settled) {
                return;
            }
            if (code === 0) {
                rejectOnce(new Error("Worker exited before export completed"));
                return;
            }
            rejectOnce(createWorkerExitError(code, signal));
        });

        try {
            worker.send(exportParams);
        } catch (error) {
            rejectOnce(error);
        }
    });
}

function cleanupWorker(worker) {
    if (!worker) {
        return;
    }
    if (typeof worker.disconnect === 'function') {
        try {
            worker.disconnect();
        } catch (error) {
            // Ignore cleanup errors after the export result has already been settled.
        }
    }
    if (typeof worker.kill === 'function' && !worker.killed) {
        try {
            worker.kill();
        } catch (error) {
            // Ignore cleanup errors after the export result has already been settled.
        }
    }
}

function createWorkerExitError(code, signal) {
    if (signal) {
        return new Error(`Worker exited with signal ${signal}`);
    }
    return new Error(`Worker exited with code ${code}`);
}

function resolveNodeCommand(options = {}) {
    const env = options.env || process.env;
    const fsImpl = options.fs || fs;
    const platform = options.platform || process.platform;
    const executableName = platform === 'win32' ? 'node.exe' : 'node';
    const envPath = readEnvPath(['F_RECORD_NODE_PATH'], env);

    if (envPath !== null) {
        return envPath;
    }

    if (isNodeExecutable(process.execPath, executableName, fsImpl)) {
        return process.execPath;
    }

    const baseDirs = [
        options.baseDir,
        __dirname,
    ].filter(Boolean);
    for (let i = 0; i < baseDirs.length; i++) {
        const foundPath = findNodeInAncestors(baseDirs[i], executableName, fsImpl);
        if (foundPath !== null) {
            return foundPath;
        }
    }

    return platform === 'win32' ? 'node.exe' : 'node';
}

function findNodeInAncestors(startDir, executableName, fsImpl) {
    let currentDir = path.resolve(startDir);
    while (true) {
        const candidate = path.join(currentDir, executableName);
        if (isFile(candidate, fsImpl)) {
            return candidate;
        }

        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            return null;
        }
        currentDir = parentDir;
    }
}

function readEnvPath(envNames, env) {
    for (let i = 0; i < envNames.length; i++) {
        const value = env[envNames[i]];
        if (typeof value === 'string' && value.trim() !== '') {
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

function isNodeExecutable(filePath, executableName, fsImpl) {
    return typeof filePath === 'string' &&
        path.basename(filePath).toLowerCase() === executableName.toLowerCase() &&
        isFile(filePath, fsImpl);
}

function isFile(filePath, fsImpl) {
    try {
        return fsImpl.statSync(filePath).isFile();
    } catch (error) {
        return false;
    }
}

function toWorkerError(data) {
    if (data instanceof Error) {
        return data;
    }
    if (data && typeof data.message === 'string') {
        const error = new Error(data.message);
        Object.keys(data).forEach((key) => {
            error[key] = data[key];
        });
        return error;
    }
    return new Error("Export worker failed");
}

module.exports = {
    cleanupWorker,
    createWorkerExitError,
    resolveNodeCommand,
    runExportReplayWorker,
    toWorkerError,
};
