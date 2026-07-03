const assert = require("assert");
const {
    readJsonFile,
    shouldRetryReadJsonError,
} = require("../src/storage");

function createReadSequence(values) {
    const calls = [];
    return {
        calls,
        fs: {
            existsSync: () => true,
            readFileSync: () => {
                calls.push("read");
                const value = values.shift();
                if (value instanceof Error) {
                    throw value;
                }
                return value;
            },
        },
    };
}

const syntaxThenValid = createReadSequence([
    "{",
    JSON.stringify({ ok: true }),
]);
const syntaxSleeps = [];
assert.deepStrictEqual(
    readJsonFile("configData.json", {
        fs: syntaxThenValid.fs,
        retryDelays: [1],
        sleepSync: delay => syntaxSleeps.push(delay),
    }),
    { ok: true },
);
assert.deepStrictEqual(syntaxThenValid.calls, ["read", "read"]);
assert.deepStrictEqual(syntaxSleeps, [1]);

const busyError = new Error("busy");
busyError.code = "EBUSY";
const busyThenValid = createReadSequence([
    busyError,
    JSON.stringify({ count: 2 }),
]);
const busySleeps = [];
assert.deepStrictEqual(
    readJsonFile("document.json", {
        fs: busyThenValid.fs,
        retryDelays: [5],
        sleepSync: delay => busySleeps.push(delay),
    }),
    { count: 2 },
);
assert.deepStrictEqual(busyThenValid.calls, ["read", "read"]);
assert.deepStrictEqual(busySleeps, [5]);

const invalidAfterRetry = createReadSequence(["{", "{"]);
assert.strictEqual(
    readJsonFile("broken.json", {
        fs: invalidAfterRetry.fs,
        retryDelays: [1],
        sleepSync: () => {},
    }),
    null,
);
assert.deepStrictEqual(invalidAfterRetry.calls, ["read", "read"]);

const enoentError = new Error("missing");
enoentError.code = "ENOENT";
const nonRetryable = createReadSequence([enoentError, JSON.stringify({ ignored: true })]);
assert.strictEqual(
    readJsonFile("missing.json", {
        fs: nonRetryable.fs,
        retryDelays: [1],
        sleepSync: () => {
            throw new Error("should not sleep");
        },
    }),
    null,
);
assert.deepStrictEqual(nonRetryable.calls, ["read"]);

assert.strictEqual(shouldRetryReadJsonError(new SyntaxError("bad json")), true);
assert.strictEqual(shouldRetryReadJsonError(busyError), true);
assert.strictEqual(shouldRetryReadJsonError(enoentError), false);
