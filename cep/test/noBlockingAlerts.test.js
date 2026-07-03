const assert = require("assert");
const fs = require("fs");
const path = require("path");

const panelDir = path.join(__dirname, "..", "src", "panel");
const panelFiles = fs
    .readdirSync(panelDir)
    .filter(fileName => /\.(ts|tsx)$/.test(fileName))
    .map(fileName => path.join(panelDir, fileName));

const filesUsingAlert = panelFiles.filter(filePath => {
    const source = fs.readFileSync(filePath, "utf8");
    return /\balert\s*\(/.test(source);
});

assert.deepStrictEqual(filesUsingAlert, []);
