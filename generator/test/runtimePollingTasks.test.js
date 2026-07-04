const assert = require("assert");
const { createRuntimePollingTaskDefinitions } = require("../src/runtimePollingTasks");

const updateConfigData = () => {};
const updateDocument = () => {};
const updateDocumentTimeSpent = () => {};

const definitions = createRuntimePollingTaskDefinitions({
    updateConfigData,
    updateDocument,
    updateDocumentTimeSpent,
});

assert.strictEqual(definitions.length, 3);
assert.deepStrictEqual(
    definitions.map(definition => ({
        name: definition.name,
        intervalMs: definition.intervalMs,
        runImmediately: definition.runImmediately,
    })),
    [
        { name: "loopUpdateConfigData", intervalMs: 500, runImmediately: true },
        { name: "loopUpdateDocument", intervalMs: 500, runImmediately: true },
        { name: "loopUpdateDocumentTimeSpent", intervalMs: 1000, runImmediately: false },
    ],
);
assert.strictEqual(definitions[0].run, updateConfigData);
assert.strictEqual(definitions[1].run, updateDocument);
assert.strictEqual(definitions[2].run, updateDocumentTimeSpent);
