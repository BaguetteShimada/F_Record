const assert = require("assert");
const savePixmap = require("../src/savePixmap");

(async () => {
    const originalConsoleError = console.error;
    const consoleErrorCalls = [];
    console.error = (...args) => {
        consoleErrorCalls.push(args);
    };

    try {
        await assert.rejects(
            () => savePixmap(null, "C:/recordings/000001.jpg", { quality: 70 }),
            /缺少必要参数/,
        );
        assert.deepStrictEqual(consoleErrorCalls, []);
    } finally {
        console.error = originalConsoleError;
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
