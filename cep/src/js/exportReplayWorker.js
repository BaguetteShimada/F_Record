const path = require('path');
const { spawn } = require('child_process');

function runExportReplayWorker(exportParams, onProgress, options = {}) {
    const spawnFn = options.spawn || spawn;
    const nodeCommand = options.nodeCommand || 'node';
    const workerPath = options.workerPath || path.join(options.baseDir || __dirname, 'exportReplay.js');

    return new Promise((resolve, reject) => {
        let settled = false;

        const resolveOnce = () => {
            if (!settled) {
                settled = true;
                resolve();
            }
        };

        const rejectOnce = (error) => {
            if (!settled) {
                settled = true;
                reject(error);
            }
        };

        let worker = null;
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

function createWorkerExitError(code, signal) {
    if (signal) {
        return new Error(`Worker exited with signal ${signal}`);
    }
    return new Error(`Worker exited with code ${code}`);
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
    createWorkerExitError,
    runExportReplayWorker,
    toWorkerError,
};
