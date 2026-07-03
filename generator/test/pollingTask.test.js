const assert = require("assert");
const { createPollingTask } = require("../src/pollingTask");

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    let immediateRuns = 0;
    const immediateTask = createPollingTask({
        intervalMs: 20,
        run: () => {
            immediateRuns += 1;
        },
    });
    immediateTask.start();
    assert.strictEqual(immediateRuns, 1);
    immediateTask.stop();

    let delayedRuns = 0;
    const delayedTask = createPollingTask({
        intervalMs: 20,
        run: () => {
            delayedRuns += 1;
        },
        runImmediately: false,
    });
    delayedTask.start();
    assert.strictEqual(delayedRuns, 0);
    await wait(30);
    delayedTask.stop();
    assert.strictEqual(delayedRuns, 1);

    let stoppedRuns = 0;
    const stoppedTask = createPollingTask({
        intervalMs: 10,
        run: () => {
            stoppedRuns += 1;
        },
    });
    stoppedTask.start();
    stoppedTask.stop();
    const stoppedRunsAfterStop = stoppedRuns;
    await wait(30);
    assert.strictEqual(stoppedRuns, stoppedRunsAfterStop);

    let activeRuns = 0;
    let maxConcurrentRuns = 0;
    let currentRuns = 0;
    const nonOverlappingTask = createPollingTask({
        intervalMs: 1,
        run: async () => {
            activeRuns += 1;
            currentRuns += 1;
            maxConcurrentRuns = Math.max(maxConcurrentRuns, currentRuns);
            await wait(15);
            currentRuns -= 1;
        },
    });
    nonOverlappingTask.start();
    await wait(40);
    nonOverlappingTask.stop();
    assert.ok(activeRuns >= 2);
    assert.strictEqual(maxConcurrentRuns, 1);

    const errors = [];
    const errorTask = createPollingTask({
        intervalMs: 10,
        run: () => {
            throw new Error("poll failed");
        },
        onError: error => errors.push(error.message),
    });
    errorTask.start();
    errorTask.stop();
    assert.deepStrictEqual(errors, ["poll failed"]);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
