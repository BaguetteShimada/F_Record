const assert = require("assert");
const { getTimeSpentUpdateSkipReason } = require("../src/timeSpentEligibility");

const enabledConfig = { isEnabled: true };
const enabledDocument = { id: 7, createTime: "2026-07-04-12-00-00-000" };

assert.strictEqual(
    getTimeSpentUpdateSkipReason(enabledConfig, enabledDocument, () => true),
    null,
);
assert.strictEqual(
    getTimeSpentUpdateSkipReason(null, enabledDocument, () => true),
    "not-ready",
);
assert.strictEqual(
    getTimeSpentUpdateSkipReason(enabledConfig, null, () => true),
    "not-ready",
);
assert.strictEqual(
    getTimeSpentUpdateSkipReason({ isEnabled: false }, enabledDocument, () => true),
    "disabled",
);
assert.strictEqual(
    getTimeSpentUpdateSkipReason(enabledConfig, { id: null, createTime: enabledDocument.createTime }, () => true),
    "no-document",
);
assert.strictEqual(
    getTimeSpentUpdateSkipReason(enabledConfig, { id: 7, createTime: null }, () => true),
    "no-document",
);
assert.strictEqual(
    getTimeSpentUpdateSkipReason(enabledConfig, enabledDocument, () => false),
    "missing-document-value",
);
