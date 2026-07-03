const assert = require("assert");
const {
    applyTimeSpentTick,
    getNextImageName,
    markImageSaved,
    shouldHandleImageChanged,
} = require("../src/recordingLogic");

assert.strictEqual(getNextImageName(0), "000001.jpg");
assert.strictEqual(getNextImageName(12), "000013.jpg");

assert.deepStrictEqual(
    markImageSaved({ count: 1, timeSpent: 2, lastModifiedTime: 1000 }, 2000),
    { count: 2, timeSpent: 2, lastModifiedTime: 2000 },
);

assert.deepStrictEqual(
    applyTimeSpentTick({ count: 1, timeSpent: 2, lastModifiedTime: 1000 }, "1", 30 * 1000),
    { count: 1, timeSpent: 3, lastModifiedTime: 1000 },
);
assert.deepStrictEqual(
    applyTimeSpentTick({ count: 1, timeSpent: 2, lastModifiedTime: 1000 }, "1", 90 * 1000),
    { count: 1, timeSpent: 2, lastModifiedTime: 1000 },
);
assert.deepStrictEqual(
    applyTimeSpentTick({ count: 1, timeSpent: 2, lastModifiedTime: 1000 }, "0", 90 * 1000),
    { count: 1, timeSpent: 3, lastModifiedTime: 1000 },
);
assert.deepStrictEqual(
    applyTimeSpentTick({ count: 1, timeSpent: 2, lastModifiedTime: null }, "0", 90 * 1000),
    { count: 1, timeSpent: 2, lastModifiedTime: null },
);

const enabledConfig = {
    isEnabled: true,
    lastExportTime: null,
};
const nowDocument = {
    id: 7,
    createTime: "2026-07-03-12-00-00-000",
};
const pixelChangedEvent = {
    id: 7,
    layers: [{ pixels: true }],
};

assert.strictEqual(shouldHandleImageChanged(pixelChangedEvent, enabledConfig, nowDocument, 10000), true);
assert.strictEqual(shouldHandleImageChanged(pixelChangedEvent, null, nowDocument, 10000), false);
assert.strictEqual(shouldHandleImageChanged(pixelChangedEvent, { isEnabled: false, lastExportTime: null }, nowDocument, 10000), false);
assert.strictEqual(shouldHandleImageChanged(pixelChangedEvent, enabledConfig, null, 10000), false);
assert.strictEqual(shouldHandleImageChanged({ id: 9, layers: [{ pixels: true }] }, enabledConfig, nowDocument, 10000), false);
assert.strictEqual(shouldHandleImageChanged({ id: 7, layers: [{ pixels: false }] }, enabledConfig, nowDocument, 10000), false);
assert.strictEqual(shouldHandleImageChanged({ id: 7 }, enabledConfig, nowDocument, 10000), false);
assert.strictEqual(
    shouldHandleImageChanged(pixelChangedEvent, { isEnabled: true, lastExportTime: 9000 }, nowDocument, 10000),
    false,
);
