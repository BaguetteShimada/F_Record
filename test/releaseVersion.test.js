const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const readJson = relativePath => JSON.parse(
    fs.readFileSync(path.join(rootDir, ...relativePath.split("/")), "utf8"),
);

const version = readJson("package.json").version;
assert.strictEqual(version, "3.2.0", "this release must be version 3.2.0");

for (const packagePath of [
    "cep/package.json",
    "generator/package.json",
    "cep/src/package.json",
]) {
    assert.strictEqual(
        readJson(packagePath).version,
        version,
        `${packagePath} must match the root package version`,
    );
}

const manifest = fs.readFileSync(
    path.join(rootDir, "cep", "src", "CSXS", "manifest.xml"),
    "utf8",
);
const bundleVersion = /ExtensionBundleVersion="([^"]+)"/.exec(manifest);
assert.ok(bundleVersion, "CEP manifest must declare ExtensionBundleVersion");
assert.strictEqual(bundleVersion[1], version);

const panelVersion = /<Extension\s+Id="com\.F_know\.F_Record\.panel"\s+Version="([^"]+)"\s*\/>/.exec(manifest);
assert.ok(panelVersion, "CEP manifest must declare the panel version");
assert.strictEqual(panelVersion[1], version.split(".").slice(0, 2).join("."));

for (const readmePath of ["README.md", "README_EN.md"]) {
    const readme = fs.readFileSync(path.join(rootDir, readmePath), "utf8");
    assert.ok(readme.includes(version), `${readmePath} must mention version ${version}`);
    assert.ok(
        readme.includes(`/releases/download/${version}/F_Record.zip`),
        `${readmePath} must link to the ${version} release asset`,
    );
}

const releaseNotesPath = path.join(rootDir, "docs", "releases", `${version}.md`);
assert.ok(fs.existsSync(releaseNotesPath), `release notes must exist at docs/releases/${version}.md`);
const releaseNotes = fs.readFileSync(releaseNotesPath, "utf8");
assert.match(releaseNotes, new RegExp(`^## F_Record ${version.replace(/\./g, "\\.")}`));
