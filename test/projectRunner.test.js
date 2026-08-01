const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
    createPackageManagerArgs,
    detectPackageManager,
    quoteCmdExecutable,
    resolvePackageManagerInvocation,
    selectPackageManager,
} = require("../scripts/projectRunner");

assert.strictEqual(detectPackageManager("pnpm/11.7.0 npm/? node/v24 win32 x64"), "pnpm");
assert.strictEqual(detectPackageManager("yarn/1.22.22 npm/? node/v20 win32 x64"), "yarn");
assert.strictEqual(detectPackageManager("npm/10.9.0 node/v22 win32 x64"), "npm");
assert.strictEqual(detectPackageManager(""), "npm");
assert.strictEqual(selectPackageManager("", "pnpm@11.7.0"), "pnpm");
assert.strictEqual(
    selectPackageManager("npm/10.9.0 node/v22 win32 x64", "pnpm@11.7.0"),
    "npm",
);

assert.strictEqual(quoteCmdExecutable("pnpm"), "pnpm");
assert.strictEqual(
    quoteCmdExecutable("C:\\Program Files\\pnpm\\pnpm.cmd"),
    '"C:\\Program Files\\pnpm\\pnpm.cmd"',
);

assert.deepStrictEqual(
    createPackageManagerArgs("pnpm", "C:\\repo\\cep", ["run", "build"]),
    ["--dir", "C:\\repo\\cep", "run", "build"],
);
assert.deepStrictEqual(
    createPackageManagerArgs("pnpm", "C:\\repo\\cep", ["install"], { frozenLockfile: true }),
    ["--dir", "C:\\repo\\cep", "install", "--frozen-lockfile"],
);
assert.deepStrictEqual(
    createPackageManagerArgs("yarn", "C:\\repo\\cep", ["install"]),
    ["--cwd", "C:\\repo\\cep", "install"],
);
assert.deepStrictEqual(
    createPackageManagerArgs("npm", "C:\\repo\\cep", ["run", "test"]),
    ["--prefix", "C:\\repo\\cep", "run", "test"],
);

assert.deepStrictEqual(
    resolvePackageManagerInvocation(
        "pnpm",
        { npm_execpath: "C:\\Program Files\\pnpm\\pnpm.cjs" },
        "C:\\Program Files\\nodejs\\node.exe",
    ),
    {
        command: "C:\\Program Files\\nodejs\\node.exe",
        prefixArgs: ["C:\\Program Files\\pnpm\\pnpm.cjs"],
    },
);
assert.deepStrictEqual(
    resolvePackageManagerInvocation(
        "npm",
        { npm_execpath: "C:\\Tools With Spaces\\npm-cli.js" },
        "C:\\Program Files\\nodejs\\node.exe",
    ),
    {
        command: "C:\\Program Files\\nodejs\\node.exe",
        prefixArgs: ["C:\\Tools With Spaces\\npm-cli.js"],
    },
);
assert.deepStrictEqual(
    resolvePackageManagerInvocation("pnpm", { npm_execpath: "C:\\Tools\\pnpm.cmd" }),
    {
        command: "C:\\Tools\\pnpm.cmd",
        prefixArgs: [],
    },
);
assert.deepStrictEqual(
    resolvePackageManagerInvocation("pnpm", { npm_execpath: "C:\\Tools\\npm-cli.js" }),
    {
        command: "pnpm",
        prefixArgs: [],
    },
);

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record project runner-"));
try {
    const nodeBinDir = path.join(tempRoot, "node", "bin");
    const packageManagerBinDir = path.join(tempRoot, "node", "node_modules", "pnpm", "bin");
    fs.mkdirSync(nodeBinDir, { recursive: true });
    fs.mkdirSync(packageManagerBinDir, { recursive: true });
    const pnpmCliPath = path.join(packageManagerBinDir, "pnpm.cjs");
    fs.writeFileSync(pnpmCliPath, "");
    const nodeExecPath = path.join(nodeBinDir, "node.exe");

    assert.deepStrictEqual(
        resolvePackageManagerInvocation("pnpm", {}, nodeExecPath),
        {
            command: nodeExecPath,
            prefixArgs: [pnpmCliPath],
        },
    );
} finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
}
