const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const DEFAULT_EXPORT_WORKER_TIMEOUT_MS = 30 * 60 * 1000;
const OUTPUT_TAIL_LIMIT = 4096;

function runExportReplayWorker(exportParams, onProgress, options = {}) {
    const spawnFn = options.spawn || spawn;
    const workerPath = options.workerPath || path.join(options.baseDir || __dirname, 'exportReplay.js');
    const nodeCommand = options.nodeCommand || resolveNodeCommand({
        baseDir: path.dirname(workerPath),
        env: options.env,
        fs: options.fs,
        platform: options.platform,
    });
    const timeoutMs = options.timeoutMs === undefined ? DEFAULT_EXPORT_WORKER_TIMEOUT_MS : options.timeoutMs;

    return new Promise((resolve, reject) => {
        let settled = false;
        let worker = null;
        let timeout = null;
        const output = {
            stdout: "",
            stderr: "",
        };

        const resolveOnce = () => {
            if (!settled) {
                settled = true;
                clearWorkerTimeout(timeout);
                cleanupWorker(worker);
                resolve();
            }
        };

        const rejectOnce = (error) => {
            if (!settled) {
                settled = true;
                clearWorkerTimeout(timeout);
                cleanupWorker(worker);
                reject(error);
            }
        };

        try {
            worker = spawnFn(nodeCommand, [workerPath], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            });
        } catch (error) {
            rejectOnce(createSpawnError(error, nodeCommand));
            return;
        }

        consumeWorkerOutput(worker, output);
        timeout = startWorkerTimeout(timeoutMs, () => {
            rejectOnce(createWorkerTimeoutError(timeoutMs, output));
        });

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
            rejectOnce(createWorkerExitError(code, signal, output));
        });

        try {
            worker.send(exportParams);
        } catch (error) {
            rejectOnce(error);
        }
    });
}

function consumeWorkerOutput(worker, output) {
    consumeStream(worker && worker.stdout, chunk => {
        output.stdout = appendOutputTail(output.stdout, chunk);
    });
    consumeStream(worker && worker.stderr, chunk => {
        output.stderr = appendOutputTail(output.stderr, chunk);
    });
}

function consumeStream(stream, onData) {
    if (!stream || typeof stream.on !== 'function') {
        return;
    }
    stream.on('data', onData);
}

function appendOutputTail(currentValue, chunk) {
    const nextValue = currentValue + String(chunk);
    if (nextValue.length <= OUTPUT_TAIL_LIMIT) {
        return nextValue;
    }
    return nextValue.slice(nextValue.length - OUTPUT_TAIL_LIMIT);
}

function startWorkerTimeout(timeoutMs, onTimeout) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
        return null;
    }
    return setTimeout(onTimeout, timeoutMs);
}

function clearWorkerTimeout(timeout) {
    if (timeout !== null) {
        clearTimeout(timeout);
    }
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

function createWorkerExitError(code, signal, output = {}) {
    const stderr = formatWorkerOutput(output.stderr);
    if (signal) {
        return createErrorWithCode(`Worker exited with signal ${signal}${stderr}`, "EXPORT_WORKER_EXITED");
    }
    return createErrorWithCode(`Worker exited with code ${code}${stderr}`, "EXPORT_WORKER_EXITED");
}

function createWorkerTimeoutError(timeoutMs, output = {}) {
    return createErrorWithCode(
        `Export worker timed out after ${timeoutMs}ms${formatWorkerOutput(output.stderr)}`,
        "EXPORT_WORKER_TIMEOUT",
    );
}

function createSpawnError(error, nodeCommand) {
    if (error && (error.code === "ENOENT" || error.code === "EACCES")) {
        const nodeError = createMissingNodeRuntimeError(nodeCommand);
        nodeError.cause = error;
        return nodeError;
    }
    return error;
}

function createMissingNodeRuntimeError(source) {
    return createErrorWithCode(
        `Node.js runtime is not available (${source}). Set F_RECORD_NODE_PATH to the full path of node.exe, or install Node.js so node.exe is available in PATH.`,
        "MISSING_NODE_RUNTIME",
    );
}

function createErrorWithCode(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function formatWorkerOutput(value) {
    if (typeof value !== "string" || value.trim() === "") {
        return "";
    }
    return `\nstderr:\n${value.trim()}`;
}

function resolveNodeCommand(options = {}) {
    const env = options.env || process.env;
    const fsImpl = options.fs || fs;
    const platform = options.platform || process.platform;
    const executableName = platform === 'win32' ? 'node.exe' : 'node';
    const envPath = readEnvPath(['F_RECORD_NODE_PATH'], env);

    if (envPath !== null) {
        if (!isFile(envPath, fsImpl)) {
            throw createMissingNodeRuntimeError(envPath);
        }
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
    for (let currentDir = path.resolve(startDir); currentDir;) {
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
    return null;
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
    DEFAULT_EXPORT_WORKER_TIMEOUT_MS,
    cleanupWorker,
    createWorkerExitError,
    createWorkerTimeoutError,
    resolveNodeCommand,
    runExportReplayWorker,
    toWorkerError,
};
