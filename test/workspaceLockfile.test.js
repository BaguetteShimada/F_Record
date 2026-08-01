const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
const workspaceYaml = fs.readFileSync(path.join(rootDir, "pnpm-workspace.yaml"), "utf8");
const lockfile = fs.readFileSync(path.join(rootDir, "pnpm-lock.yaml"), "utf8");

assert.strictEqual(packageJson.packageManager, "pnpm@11.7.0");
assert.match(workspaceYaml, /-\s+"cep"/);
assert.match(workspaceYaml, /-\s+"generator"/);
assert.match(lockfile, /\n\s+\.:/);
assert.match(lockfile, /\n\s+cep:/);
assert.match(lockfile, /\n\s+generator:/);
