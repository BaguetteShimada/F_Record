const assert = require("assert");
const fs = require("fs");
const path = require("path");

const panelDir = path.join(__dirname, "..", "src", "panel");
const panelFiles = fs
    .readdirSync(panelDir)
    .filter(fileName => fileName.endsWith(".tsx"))
    .map(fileName => path.join(panelDir, fileName));

const toastContainerUsages = [];

for (const filePath of panelFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    const matches = source.match(/<ToastContainer\b/g) ?? [];
    for (let index = 0; index < matches.length; index += 1) {
        toastContainerUsages.push(path.relative(path.join(__dirname, ".."), filePath));
    }
}

assert.deepStrictEqual(toastContainerUsages, [path.join("src", "panel", "Panel.tsx")]);
