const assert = require("assert");
const EventEmitter = require("events");
const {
    resolveNodeCommand,
    runExportReplayWorker,
    toWorkerError,
} = require("../src/js/exportReplayWorker");

function createFakeWorker(onSend) {
    const worker = new EventEmitter();
    worker.sentMessages = [];
    worker.disconnected = false;
    worker.killed = false;
    worker.disconnect = () => {
        worker.disconnected = true;
    };
    worker.kill = () => {
        worker.killed = true;
    };
    worker.send = (message) => {
        worker.sentMessages.push(message);
        onSend(worker, message);
    };
    return worker;
}

(async () => {
    const progress = [];
    const spawned = [];
    let successWorker = null;
    await runExportReplayWorker(
        { job: "export" },
        data => progress.push(data),
        {
            nodeCommand: "custom-node",
            workerPath: "worker.js",
            spawn: (command, args, options) => {
                spawned.push({ command, args, options });
                successWorker = createFakeWorker((worker) => {
                    process.nextTick(() => {
                        worker.emit("message", {
                            type: "exportReplayProgress",
                            data: { status: "loading image...", percent: 10 },
                        });
                        worker.emit("message", { type: "exportReplaySuccess", data: null });
                        worker.emit("exit", 0);
                    });
                });
                return successWorker;
            },
        },
    );

    assert.deepStrictEqual(spawned, [{
        command: "custom-node",
        args: ["worker.js"],
        options: { stdio: ["pipe", "pipe", "pipe", "ipc"] },
    }]);
    assert.deepStrictEqual(successWorker.sentMessages, [{ job: "export" }]);
    assert.strictEqual(successWorker.disconnected, true);
    assert.strictEqual(successWorker.killed, true);
    assert.deepStrictEqual(progress, [{ status: "loading image...", percent: 10 }]);

    await assert.rejects(
        () => runExportReplayWorker(
            {},
            () => {},
            {
                spawn: () => createFakeWorker((worker) => {
                    process.nextTick(() => {
                        worker.emit("message", {
                            type: "exportReplayError",
                            data: { message: "ffmpeg failed", code: "FFMPEG" },
                        });
                        worker.emit("exit", 0);
                    });
                }),
            },
        ),
        error => error.message === "ffmpeg failed" && error.code === "FFMPEG",
    );

    await assert.rejects(
        () => runExportReplayWorker(
            {},
            () => {
                throw new Error("progress failed");
            },
            {
                spawn: () => createFakeWorker((worker) => {
                    process.nextTick(() => {
                        worker.emit("message", {
                            type: "exportReplayProgress",
                            data: { status: "loading image...", percent: 10 },
                        });
                        worker.emit("message", { type: "exportReplaySuccess", data: null });
                    });
                }),
            },
        ),
        /progress failed/,
    );

    await assert.rejects(
        () => runExportReplayWorker(
            {},
            () => {},
            {
                spawn: () => createFakeWorker((worker) => {
                    process.nextTick(() => {
                        worker.emit("exit", 0);
                    });
                }),
            },
        ),
        /Worker exited before export completed/,
    );

    await assert.rejects(
        () => runExportReplayWorker(
            {},
            () => {},
            {
                spawn: () => createFakeWorker((worker) => {
                    process.nextTick(() => {
                        worker.emit("exit", 7);
                    });
                }),
            },
        ),
        /Worker exited with code 7/,
    );

    await assert.rejects(
        () => runExportReplayWorker(
            {},
            () => {},
            {
                spawn: () => {
                    throw new Error("spawn failed");
                },
            },
        ),
        /spawn failed/,
    );

    const restoredError = toWorkerError({
        name: "Error",
        message: "ffmpeg failed",
        stack: "Error: ffmpeg failed\n    at export",
        code: "FFMPEG",
    });
    assert.strictEqual(restoredError.message, "ffmpeg failed");
    assert.strictEqual(restoredError.stack, "Error: ffmpeg failed\n    at export");
    assert.strictEqual(restoredError.code, "FFMPEG");

    assert.strictEqual(toWorkerError({}).message, "Export worker failed");

    assert.strictEqual(
        resolveNodeCommand({
            env: { F_RECORD_NODE_PATH: `"C:\\Tools\\node.exe"` },
            platform: "win32",
        }),
        "C:\\Tools\\node.exe",
    );

    const fakeFiles = new Set([
        "C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\node.exe",
    ]);
    const fakeFs = {
        statSync(filePath) {
            if (fakeFiles.has(filePath)) {
                return { isFile: () => true };
            }
            throw new Error("not found");
        },
    };
    assert.strictEqual(
        resolveNodeCommand({
            baseDir: "C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\Required\\CEP\\extensions\\com.f_know.f_record.cep\\js",
            env: {},
            fs: fakeFs,
            platform: "win32",
        }),
        "C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\node.exe",
    );

    assert.strictEqual(
        resolveNodeCommand({
            baseDir: "C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\Required\\CEP\\extensions\\com.f_know.f_record.cep\\js",
            env: {},
            fs: {
                statSync() {
                    throw new Error("not found");
                },
            },
            platform: "win32",
        }),
        "node.exe",
    );
})().catch(error => {
    console.error(error);
    process.exit(1);
});
