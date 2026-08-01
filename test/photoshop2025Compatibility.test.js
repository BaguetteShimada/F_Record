const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const manifestPath = path.join(rootDir, "cep", "src", "CSXS", "manifest.xml");
const manifest = fs.readFileSync(manifestPath, "utf8");

function parseVersion(value) {
    const parts = value.split(".").map(Number);
    assert.ok(parts.length >= 1 && parts.length <= 4, `Invalid version: ${value}`);
    assert.ok(parts.every(Number.isInteger), `Invalid version: ${value}`);
    while (parts.length < 4) {
        parts.push(0);
    }
    return parts;
}

function compareVersions(left, right) {
    for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) {
            return left[index] < right[index] ? -1 : 1;
        }
    }
    return 0;
}

function cepRangeIncludes(range, version) {
    const target = parseVersion(version);
    if (/^\d+(\.\d+){0,3}$/.test(range)) {
        return compareVersions(target, parseVersion(range)) >= 0;
    }

    const match = /^(\[|\()(\d+(?:\.\d+){0,3}),(\d+(?:\.\d+){0,3})(\]|\))$/.exec(range);
    assert.ok(match, `Invalid CEP host range: ${range}`);
    const lowerComparison = compareVersions(target, parseVersion(match[2]));
    const upperComparison = compareVersions(target, parseVersion(match[3]));
    const meetsLowerBound = match[1] === "[" ? lowerComparison >= 0 : lowerComparison > 0;
    const meetsUpperBound = match[4] === "]" ? upperComparison <= 0 : upperComparison < 0;
    return meetsLowerBound && meetsUpperBound;
}

function readHostRange(hostName) {
    const match = new RegExp(`<Host\\s+Name="${hostName}"\\s+Version="([^"]+)"\\s*/>`).exec(manifest);
    assert.ok(match, `Missing ${hostName} host declaration`);
    return match[1];
}

for (const hostName of ["PHXS", "PHSP"]) {
    const range = readHostRange(hostName);
    assert.ok(cepRangeIncludes(range, "23.0"), `${hostName} must support Photoshop 2022`);
    assert.ok(cepRangeIncludes(range, "26.9"), `${hostName} must support Photoshop 2025`);
    assert.strictEqual(cepRangeIncludes(range, "27.0"), false, `${hostName} must not claim untested Photoshop 2026 support`);
}

const requiredRuntimeMatch = /<RequiredRuntime\s+Name="CSXS"\s+Version="([^"]+)"\s*\/>/.exec(manifest);
assert.ok(requiredRuntimeMatch, "Missing CSXS runtime declaration");
assert.ok(
    compareVersions(parseVersion("12.0"), parseVersion(requiredRuntimeMatch[1])) >= 0,
    "Photoshop 2025 CEP 12 must satisfy the required CSXS runtime",
);

const generatorPackage = JSON.parse(
    fs.readFileSync(path.join(rootDir, "generator", "package.json"), "utf8"),
);
const generatorRangeMatch = /^(\d+(?:\.\d+){0,2})\s+-\s+(\d+(?:\.\d+){0,2})$/.exec(
    generatorPackage["generator-core-version"],
);
assert.ok(generatorRangeMatch, "Generator Core compatibility must use a hyphen range");

const generatorCore2025 = parseVersion("3.12.1");
const generatorMinimum = parseVersion(generatorRangeMatch[1]);
const upperParts = generatorRangeMatch[2].split(".");
const generatorMaximum = parseVersion(generatorRangeMatch[2]);
for (let index = upperParts.length; index < generatorMaximum.length; index += 1) {
    generatorMaximum[index] = Number.MAX_SAFE_INTEGER;
}
assert.ok(
    compareVersions(generatorCore2025, generatorMinimum) >= 0 &&
        compareVersions(generatorCore2025, generatorMaximum) <= 0,
    "Photoshop 2025 Generator Core 3.12.1 must satisfy generator-core-version",
);
