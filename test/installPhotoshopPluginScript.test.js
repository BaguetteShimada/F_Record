const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const scriptPath = path.join(__dirname, "..", "scripts", "installPhotoshopPlugin.ps1");
const script = fs.readFileSync(scriptPath, "utf8");

assert.match(script, /function Assert-DirectoryWritable/);
assert.match(script, /Adobe Photoshop 2025/);
assert.match(script, /\$releasePackageRoot\s*=\s*\[IO\.Path\]::GetFullPath\(\$PSScriptRoot\)/);
assert.match(script, /\$isReleasePackage\s*=/);
assert.match(script, /Join-Path \$releasePackageRoot "com\.f_know\.f_record\.cep"/);
assert.match(script, /Join-Path \$releasePackageRoot "com\.f_know\.f_record\.generator"/);
assert.match(script, /\$BuildRoot\s*=\s*if \(\$isReleasePackage\) \{\s*\$releasePackageRoot/s);
assert.match(script, /\$backupBase\s*=\s*if \(\$isReleasePackage\) \{ \$releasePackageRoot \}/);
assert.match(script, /function Assert-FileExists/);
assert.match(script, /function Assert-CepManifestSupportsPhotoshop/);
assert.match(script, /Run PowerShell as Administrator, then retry the install script\./);
assert.match(script, /if \(-not \$WhatIfPreference\) \{\s+Assert-DirectoryWritable/s);
assert.match(script, /if \(-not \$WhatIfPreference\) \{\s+New-Item -ItemType Directory -Force -Path \$BackupRoot/s);
assert.match(script, /Preflight complete\. No files were changed\./);

const parseCommand = [
    "$tokens = $null",
    "$errors = $null",
    "[System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path -LiteralPath 'scripts/installPhotoshopPlugin.ps1'), [ref]$tokens, [ref]$errors) > $null",
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

if (process.platform === "win32") {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-photoshop-install-test-"));
    try {
        const fakePhotoshopRoot = path.join(tempRoot, "Adobe Photoshop 2025");
        const fakeBuildRoot = path.join(tempRoot, "dist");
        const fakeBackupRoot = path.join(tempRoot, "backup");
        fs.mkdirSync(fakePhotoshopRoot, { recursive: true });
        fs.mkdirSync(fakeBuildRoot, { recursive: true });

        const missingExecutableResult = spawnSync("powershell", [
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            scriptPath,
            "-PhotoshopRoot",
            fakePhotoshopRoot,
            "-BuildRoot",
            fakeBuildRoot,
            "-BackupRoot",
            fakeBackupRoot,
            "-WhatIf",
        ], {
            cwd: path.join(__dirname, ".."),
            encoding: "utf8",
        });

        assert.notStrictEqual(missingExecutableResult.status, 0);
        assert.match(
            `${missingExecutableResult.stdout}\n${missingExecutableResult.stderr}`,
            /Photoshop executable does not exist/,
        );
        assert.strictEqual(fs.existsSync(fakeBackupRoot), false, "-WhatIf must not create a backup directory");
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
}
