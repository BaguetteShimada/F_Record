const assert = require("assert");
const {
    ensureDirectory,
    readJsonFile,
    shouldRetryReadJsonError,
    shouldRetryWriteFileAtomicError,
    writeFileAtomicSyncWithRetry,
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

const existingDirectoryCalls = [];
ensureDirectory("C:\\recordings", {
    fs: {
        existsSync: () => true,
        mkdirSync: () => existingDirectoryCalls.push("mkdir"),
    },
});
assert.deepStrictEqual(existingDirectoryCalls, []);

const missingDirectoryCalls = [];
ensureDirectory("C:\\recordings", {
    fs: {
        existsSync: () => false,
        mkdirSync: (directoryPath, options) => missingDirectoryCalls.push([directoryPath, options]),
    },
});
assert.deepStrictEqual(missingDirectoryCalls, [
    ["C:\\recordings", { recursive: true }],
]);

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

const permissionError = new Error("permission denied");
permissionError.code = "EPERM";
const accessError = new Error("access denied");
accessError.code = "EACCES";

assert.strictEqual(shouldRetryReadJsonError(accessError), true);

assert.strictEqual(shouldRetryWriteFileAtomicError(permissionError), true);
assert.strictEqual(shouldRetryWriteFileAtomicError(accessError), true);
assert.strictEqual(shouldRetryWriteFileAtomicError(busyError), true);
assert.strictEqual(shouldRetryWriteFileAtomicError(enoentError), false);
assert.strictEqual(shouldRetryWriteFileAtomicError(null), false);

const retryWriteCalls = [];
const retryWriteSleeps = [];
writeFileAtomicSyncWithRetry("state.json", "{\"ok\":true}", {
    retryDelays: [3],
    sleepSync: delay => retryWriteSleeps.push(delay),
    writeFileAtomicSync: (filePath, data) => {
        retryWriteCalls.push([filePath, data]);
        if (retryWriteCalls.length === 1) {
            throw busyError;
        }
    },
});
assert.deepStrictEqual(retryWriteCalls, [
    ["state.json", "{\"ok\":true}"],
    ["state.json", "{\"ok\":true}"],
]);
assert.deepStrictEqual(retryWriteSleeps, [3]);

const failedWriteCalls = [];
assert.throws(
    () => writeFileAtomicSyncWithRetry("missing.json", "{}", {
        retryDelays: [1],
        sleepSync: () => {
            throw new Error("should not sleep");
        },
        writeFileAtomicSync: () => {
            failedWriteCalls.push("write");
            throw enoentError;
        },
    }),
    error => error === enoentError,
);
assert.deepStrictEqual(failedWriteCalls, ["write"]);
