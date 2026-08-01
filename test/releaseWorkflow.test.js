const assert = require("assert");
const fs = require("fs");
const path = require("path");

const workflowPath = path.join(__dirname, "..", ".github", "workflows", "release.yml");
const workflow = fs.readFileSync(workflowPath, "utf8");

assert.match(workflow, /push:\s*\r?\n\s+tags:\s*\r?\n\s+-\s+["']?\*\.\*\.\*["']?/);
assert.match(workflow, /release:\s*\r?\n\s+runs-on:\s+windows-latest\s*\r?\n\s+permissions:\s*\r?\n\s+contents:\s+write/);
assert.match(workflow, /actions\/checkout@v4/);
assert.match(workflow, /fetch-depth:\s+0/);
assert.match(workflow, /pnpm\/action-setup@v4/);
assert.match(workflow, /version:\s+11\.7\.0/);
assert.match(workflow, /actions\/setup-node@v4/);
assert.match(workflow, /node-version:\s+24/);
assert.match(workflow, /cache:\s+pnpm/);
assert.match(workflow, /pnpm install --frozen-lockfile/);
assert.match(workflow, /pnpm run check/);

for (const packagePath of [
    "package.json",
    "cep/package.json",
    "generator/package.json",
    "cep/src/package.json",
]) {
    assert.ok(workflow.includes(`"${packagePath}"`), `workflow must validate ${packagePath}`);
}

assert.match(workflow, /\$env:GITHUB_REF_NAME/);
assert.match(workflow, /\^\\d\+\\\.\\d\+\\\.\\d\+\$/);
assert.match(workflow, /cep\/src\/CSXS\/manifest\.xml/);
assert.match(workflow, /ExtensionBundleVersion/);
assert.match(workflow, /expectedPanelVersion/);
assert.match(workflow, /docs\/releases\/\$tag\.md/);
assert.match(workflow, /GH_TOKEN:\s+\$\{\{ github\.token \}\}/);
assert.match(workflow, /gh release create "\$tag" "dist\/F_Record\.zip"/);
assert.match(workflow, /--repo "\$env:GITHUB_REPOSITORY"/);
assert.match(workflow, /--title "F_Record \$tag"/);
assert.match(workflow, /--notes-file "docs\/releases\/\$tag\.md"/);
assert.match(workflow, /--verify-tag/);
