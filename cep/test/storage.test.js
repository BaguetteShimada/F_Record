const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadStorageModule(fileReads) {
    const storagePath = path.join(__dirname, "..", "src", "panel", "storage.ts");
    const source = fs.readFileSync(storagePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
        },
    });

    const module = { exports: {} };
    let now = 0;
    const context = {
        Array,
        Date: {
            now: () => {
                now += 100;
                return now;
            },
        },
        JSON,
        Object,
        SyntaxError,
        module,
        exports: module.exports,
        isExist: () => true,
        readFile: () => {
            const value = fileReads.shift();
            if (value instanceof Error) {
                throw value;
            }
            return value;
        },
        createDir: () => {},
        readDir: () => [],
        unlinkFile: () => {},
        deleteDir: () => {},
        writeFile: () => {},
    };

    vm.runInNewContext(compiled.outputText, context, { filename: storagePath });
    return {
        exports: module.exports,
    };
}

const syntaxThenValid = loadStorageModule([
    "{",
    JSON.stringify({ ok: true }),
]);
assert.deepStrictEqual(syntaxThenValid.exports.readJsonFile("configData.json"), { ok: true });

const busyError = new Error("busy");
busyError.code = "EBUSY";
const busyThenValid = loadStorageModule([
    busyError,
    JSON.stringify({ count: 2 }),
]);
assert.deepStrictEqual(busyThenValid.exports.readJsonFile("document.json"), { count: 2 });

const invalidAfterRetry = loadStorageModule(["{", "{", "{"]);
assert.strictEqual(invalidAfterRetry.exports.readJsonFile("broken.json"), null);

const enoentError = new Error("missing");
enoentError.code = "ENOENT";
const nonRetryable = loadStorageModule([
    enoentError,
    JSON.stringify({ ignored: true }),
]);
assert.strictEqual(nonRetryable.exports.readJsonFile("missing.json"), null);

assert.strictEqual(busyThenValid.exports.shouldRetryJsonReadError(busyError), true);
assert.strictEqual(nonRetryable.exports.shouldRetryJsonReadError(enoentError), false);
