const assert = require("assert");
const fs = require("fs");
const path = require("path");

const workflowPath = path.join(__dirname, "..", ".github", "workflows", "ci.yml");
const workflow = fs.readFileSync(workflowPath, "utf8");

assert.match(workflow, /runs-on:\s+windows-latest/);
assert.match(workflow, /pnpm\/action-setup@v4/);
assert.match(workflow, /version:\s+11\.7\.0/);
assert.match(workflow, /actions\/setup-node@v4/);
assert.match(workflow, /pnpm install --frozen-lockfile/);
assert.match(workflow, /pnpm run check/);
