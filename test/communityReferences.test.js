const assert = require("assert");
const { execFileSync } = require("child_process");
const fs = require("fs");

const blockedTerms = [
    ["disc", "ord"].join(""),
    ["Eq", "CV", "8ksgZ"].join(""),
];

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
})
    .split("\0")
    .filter(Boolean);

const matches = [];

for (const filePath of trackedFiles) {
    const content = fs.readFileSync(filePath, "utf8").toLowerCase();
    for (const term of blockedTerms) {
        if (content.includes(term.toLowerCase())) {
            matches.push(filePath);
            break;
        }
    }
}

assert.deepStrictEqual(matches, []);
