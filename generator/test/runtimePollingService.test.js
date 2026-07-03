const assert = require("assert");
const { createRuntimePollingService } = require("../src/runtimePollingService");

const createdTasks = [];
const startedTasks = [];
const stoppedTasks = [];
const runCalls = [];
const errors = [];

function createFakePollingTask(options) {
    createdTasks.push(options);
    return {
        start: () => {
            startedTasks.push(options);
            options.run();
        },
        stop: () => {
            stoppedTasks.push(options);
        },
    };
}

const service = createRuntimePollingService({
    createPollingTask: createFakePollingTask,
    logger: {
        error: (message, error) => errors.push([message, error.message]),
    },
    updateConfigData: () => runCalls.push("config"),
    updateDocument: () => runCalls.push("document"),
    updateDocumentTimeSpent: () => runCalls.push("timeSpent"),
});

service.start();

assert.strictEqual(createdTasks.length, 3);
assert.deepStrictEqual(
    createdTasks.map(task => [task.intervalMs, task.runImmediately]),
    [
        [500, true],
        [500, true],
        [1000, false],
    ],
);
assert.deepStrictEqual(runCalls, ["config", "document", "timeSpent"]);
assert.strictEqual(startedTasks.length, 3);

createdTasks[0].onError(new Error("config failed"));
createdTasks[1].onError(new Error("document failed"));
createdTasks[2].onError(new Error("time failed"));
assert.deepStrictEqual(errors, [
    ["loopUpdateConfigData", "config failed"],
    ["loopUpdateDocument", "document failed"],
    ["loopUpdateDocumentTimeSpent", "time failed"],
]);

service.start();
assert.strictEqual(createdTasks.length, 6);
assert.strictEqual(startedTasks.length, 6);
assert.strictEqual(stoppedTasks.length, 3);

service.stop();
assert.strictEqual(stoppedTasks.length, 6);

service.stop();
assert.strictEqual(stoppedTasks.length, 6);
