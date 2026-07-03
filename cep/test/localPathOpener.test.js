const assert = require("assert");
const {
    createOpenLocalPathCommand,
    openLocalPathWithExecFile,
} = require("../src/js/localPathOpener");

const trickyPath = 'C:\\Users\\Admin\\Videos\\paint & replay "final".mp4';

assert.deepStrictEqual(
    createOpenLocalPathCommand(trickyPath, "win32"),
    {
        file: "rundll32.exe",
        args: ["url.dll,FileProtocolHandler", trickyPath],
    },
);

assert.deepStrictEqual(
    createOpenLocalPathCommand("/Users/admin/Videos/paint & replay.mp4", "darwin"),
    {
        file: "open",
        args: ["/Users/admin/Videos/paint & replay.mp4"],
    },
);

const calls = [];
openLocalPathWithExecFile(trickyPath, {
    platform: "win32",
    execFile: (file, args) => calls.push({ file, args }),
});

assert.deepStrictEqual(calls, [{
    file: "rundll32.exe",
    args: ["url.dll,FileProtocolHandler", trickyPath],
}]);
