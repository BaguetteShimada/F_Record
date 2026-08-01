const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const scriptPath = path.join(__dirname, "..", "scripts", "run-node.ps1");
const script = fs.readFileSync(scriptPath, "utf8");

assert.match(script, /function Resolve-NodePath/);
assert.match(script, /F_RECORD_NODE_PATH/);
assert.match(script, /Get-Command node/);

const parseCommand = [
    "$tokens = $null",
    "$errors = $null",
    "[System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path -LiteralPath 'scripts/run-node.ps1'), [ref]$tokens, [ref]$errors) > $null",
    "if ($errors.Count -gt 0) { $errors | ForEach-Object { Write-Error $_.Message }; exit 1 }",
].join("; ");

const result = spawnSync("powershell", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    parseCommand,
], {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
});

assert.strictEqual(result.status, 0, result.stderr || result.stdout);
