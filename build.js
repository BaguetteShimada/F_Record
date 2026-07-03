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

function main() {
    runProjectInstall("cep");
    runProjectInstall("generator");
    runProjectScript("cep", "build");
    runProjectScript("generator", "build");

    resetDirectory(distDir);
    copyDirectory(path.join(rootDir, "cep", "dist"), cepReleaseDir);
    createGeneratorRelease();
    createZip();
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
    findBundledExportBinaryEntries,
};
