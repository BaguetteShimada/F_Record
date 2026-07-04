const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const {
    rootDir,
    runProjectInstall,
    runProjectScript,
} = require("./scripts/projectRunner");

const distDir = path.join(rootDir, "dist");
const cepReleaseDir = path.join(distDir, "com.f_know.f_record.cep");
const generatorReleaseDir = path.join(distDir, "com.f_know.f_record.generator");
const zipPath = path.join(distDir, "F_Record.zip");
const bundledExportBinaryPattern = /(^|\/)(ffmpeg|ffprobe)(\.exe)?$/i;
const cepRuntimeDependencies = [
    "fluent-ffmpeg",
    "write-file-atomic",
];
const releaseZipRequiredEntries = [
    "com.f_know.f_record.cep/CSXS/manifest.xml",
    "com.f_know.f_record.cep/index.html",
    "com.f_know.f_record.cep/index.js",
    "com.f_know.f_record.cep/init.jsx",
    "com.f_know.f_record.cep/package.json",
    "com.f_know.f_record.cep/js/exportReplay.js",
    "com.f_know.f_record.cep/js/exportReplayWorker.js",
    "com.f_know.f_record.generator/index.js",
    "com.f_know.f_record.generator/package.json",
];
const excludedNodePackageRootDirectories = new Set([
    "coverage",
    "node_modules",
]);

function main() {
    runProjectInstall("cep");
    runProjectInstall("generator");
    runProjectScript("cep", "build");
    runProjectScript("generator", "build");

    resetDirectory(distDir);
    copyDirectory(path.join(rootDir, "cep", "dist"), cepReleaseDir);
    copyCepRuntimeDependencies();
    createGeneratorRelease();
    createZip();
    assertReleaseZipStructure(zipPath);
    assertNoBundledExportBinaries(zipPath);
}

function resetDirectory(directoryPath) {
    assertInsideRoot(directoryPath);
    fs.rmSync(directoryPath, { recursive: true, force: true });
    fs.mkdirSync(directoryPath, { recursive: true });
}

function copyDirectory(sourcePath, targetPath) {
    assertInsideRoot(sourcePath);
    assertInsideRoot(targetPath);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Missing build output: ${sourcePath}`);
    }
    fs.cpSync(sourcePath, targetPath, { recursive: true });
}

function copyCepRuntimeDependencies() {
    const copiedDependencies = new Set();
    for (const dependencyName of cepRuntimeDependencies) {
        copyNodeDependencyTree(dependencyName, path.join(rootDir, "cep"), cepReleaseDir, copiedDependencies);
    }
}

function copyNodeDependencyTree(dependencyName, resolveFromDir, releaseDir, copiedDependencies) {
    if (copiedDependencies.has(dependencyName)) {
        return;
    }
    copiedDependencies.add(dependencyName);

    const packageDir = resolveNodePackageDir(dependencyName, resolveFromDir);
    const packageJsonPath = path.join(packageDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const targetDir = path.join(releaseDir, "node_modules", ...dependencyName.split("/"));

    copyNodePackageDirectory(packageDir, targetDir);

    const childDependencies = Object.assign(
        {},
        packageJson.dependencies || {},
        packageJson.optionalDependencies || {},
    );
    for (const childDependencyName of Object.keys(childDependencies)) {
        copyNodeDependencyTree(childDependencyName, packageDir, releaseDir, copiedDependencies);
    }
}

function resolveNodePackageDir(packageName, resolveFromDir) {
    const packageJsonPath = require.resolve(`${packageName}/package.json`, {
        paths: [resolveFromDir],
    });
    return path.dirname(packageJsonPath);
}

function copyNodePackageDirectory(sourcePath, targetPath) {
    assertInsideRoot(sourcePath);
    assertInsideRoot(targetPath);
    fs.rmSync(targetPath, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.cpSync(sourcePath, targetPath, {
        recursive: true,
        dereference: true,
        filter: (source) => {
            const relativePath = path.relative(sourcePath, source);
            return shouldCopyNodePackageEntry(relativePath);
        },
    });
}

function shouldCopyNodePackageEntry(relativePath) {
    if (relativePath === "") {
        return true;
    }
    return !excludedNodePackageRootDirectories.has(relativePath.split(path.sep)[0]);
}

function createGeneratorRelease() {
    resetDirectory(generatorReleaseDir);
    fs.copyFileSync(
        path.join(rootDir, "generator", "dist", "index.js"),
        path.join(generatorReleaseDir, "index.js"),
    );

    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "generator", "package.json"), "utf8"));
    const releasePackageJson = {
        name: packageJson.name,
        version: packageJson.version,
        author: packageJson.author,
        main: "index.js",
        "generator-core-version": packageJson["generator-core-version"],
    };
    fs.writeFileSync(
        path.join(generatorReleaseDir, "package.json"),
        `${JSON.stringify(releasePackageJson, null, 2)}\n`,
    );
}

function createZip() {
    const zip = new AdmZip();
    zip.addLocalFolder(cepReleaseDir, "com.f_know.f_record.cep");
    zip.addLocalFolder(generatorReleaseDir, "com.f_know.f_record.generator");
    zip.writeZip(zipPath);
}

function assertReleaseZipStructure(targetZipPath) {
    const missingEntries = findMissingReleaseZipEntries(targetZipPath);
    if (missingEntries.length > 0) {
        throw new Error(`Release zip is missing required entries:\n${missingEntries.join("\n")}`);
    }
}

function findMissingReleaseZipEntries(targetZipPath) {
    const zip = new AdmZip(targetZipPath);
    const entries = new Set(zip.getEntries().map(entry => entry.entryName.replace(/\\/g, "/")));
    return releaseZipRequiredEntries.filter(entryName => !entries.has(entryName));
}

function assertNoBundledExportBinaries(targetZipPath) {
    const matches = findBundledExportBinaryEntries(targetZipPath);
    if (matches.length > 0) {
        throw new Error(`Bundled ffmpeg/ffprobe binaries are not allowed:\n${matches.join("\n")}`);
    }
}

function findBundledExportBinaryEntries(targetZipPath) {
    const zip = new AdmZip(targetZipPath);
    return zip.getEntries()
        .map(entry => entry.entryName.replace(/\\/g, "/"))
        .filter(entryName => bundledExportBinaryPattern.test(entryName));
}

function assertInsideRoot(targetPath) {
    const resolvedRoot = path.resolve(rootDir);
    const resolvedTarget = path.resolve(targetPath);
    if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + path.sep)) {
        throw new Error(`Refusing to operate outside repository: ${resolvedTarget}`);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    assertNoBundledExportBinaries,
    assertReleaseZipStructure,
    cepRuntimeDependencies,
    findBundledExportBinaryEntries,
    findMissingReleaseZipEntries,
    releaseZipRequiredEntries,
    shouldCopyNodePackageEntry,
};
