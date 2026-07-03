const assert = require("assert");
const {
    createPackageManagerArgs,
    detectPackageManager,
} = require("../scripts/projectRunner");

assert.strictEqual(detectPackageManager("pnpm/11.7.0 npm/? node/v24 win32 x64"), "pnpm");
assert.strictEqual(detectPackageManager("yarn/1.22.22 npm/? node/v20 win32 x64"), "yarn");
assert.strictEqual(detectPackageManager("npm/10.9.0 node/v22 win32 x64"), "npm");
assert.strictEqual(detectPackageManager(""), "npm");

assert.deepStrictEqual(
    createPackageManagerArgs("pnpm", "C:\\repo\\cep", ["run", "build"]),
    ["--dir", "C:\\repo\\cep", "run", "build"],
);
assert.deepStrictEqual(
    createPackageManagerArgs("yarn", "C:\\repo\\cep", ["install"]),
    ["--cwd", "C:\\repo\\cep", "install"],
);
assert.deepStrictEqual(
    createPackageManagerArgs("npm", "C:\\repo\\cep", ["run", "test"]),
    ["--prefix", "C:\\repo\\cep", "run", "test"],
);
