const assert = require("assert");
const {
    RECENT_EXPORT_IGNORE_MS,
    applyTimeSpentTick,
    getNextImageName,
    hasPixelChanges,
    markImageSaved,
    shouldAddTimeSpent,
    shouldHandleImageChanged,
} = require("../src/recordingLogic");

assert.strictEqual(RECENT_EXPORT_IGNORE_MS, 2000);

assert.strictEqual(hasPixelChanges({ layers: [{ pixels: true }] }), true);
assert.strictEqual(hasPixelChanges({ layers: [{ pixels: false }, { pixels: true }] }), true);
assert.strictEqual(hasPixelChanges({ layers: [{ pixels: false }] }), false);
assert.strictEqual(hasPixelChanges({ layers: [null, undefined] }), false);
assert.strictEqual(hasPixelChanges({}), false);

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

assert.strictEqual(shouldAddTimeSpent(null, 0, 90 * 1000), false);
assert.strictEqual(shouldAddTimeSpent(1000, 0, 90 * 1000), true);
assert.strictEqual(shouldAddTimeSpent(1000, 1, 30 * 1000), true);
assert.strictEqual(shouldAddTimeSpent(1000, 1, 90 * 1000), false);

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
