const assert = require("assert");
const { createCaptureGate } = require("../src/captureGate");

(async () => {
    const gate = createCaptureGate();

    assert.strictEqual(gate.isActive(), false);
    assert.strictEqual(gate.tryStart(), true);
    assert.strictEqual(gate.isActive(), true);
    assert.strictEqual(gate.tryStart(), false);
    gate.finish();
    assert.strictEqual(gate.isActive(), false);

    const completedResult = await gate.run(async () => "saved");
    assert.deepStrictEqual(completedResult, { started: true, value: "saved" });
    assert.strictEqual(gate.isActive(), false);

    let releaseCapture = null;
    const runningCapture = gate.run(() => new Promise(resolve => {
        releaseCapture = resolve;
    }));

    assert.strictEqual(gate.isActive(), true);
    assert.deepStrictEqual(await gate.run(async () => "skipped"), { started: false });

    releaseCapture("done");
    assert.deepStrictEqual(await runningCapture, { started: true, value: "done" });
    assert.strictEqual(gate.isActive(), false);

    await assert.rejects(
        () => gate.run(async () => {
            throw new Error("capture failed");
        }),
        /capture failed/,
    );
    assert.strictEqual(gate.isActive(), false);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
