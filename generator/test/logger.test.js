const assert = require("assert");
const { createLogger, getErrorDetails } = require("../src/logger");

assert.strictEqual(getErrorDetails("plain error"), "plain error");

const error = new Error("failed");
assert.strictEqual(getErrorDetails(error), error.stack);

const calls = [];
const logger = createLogger({
    error: (message, details) => calls.push([message, details]),
});
logger.error("handlePixelChanged", error);
assert.deepStrictEqual(calls, [["handlePixelChanged error: ", error.stack]]);

assert.doesNotThrow(() => createLogger(null).error("ignored", error));
assert.doesNotThrow(() => createLogger({}).error("ignored", error));
