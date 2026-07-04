const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const {
    assertNoBundledExportBinaries,
    assertReleaseZipStructure,
    findBundledExportBinaryEntries,
    findMissingReleaseZipEntries,
    releaseZipRequiredEntries,
    shouldCopyNodePackageEntry,
} = require("../build");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-build-test-"));

try {
    const cleanZipPath = path.join(tempRoot, "clean.zip");
    const cleanZip = new AdmZip();
    for (const entryName of releaseZipRequiredEntries) {
        cleanZip.addFile(entryName, Buffer.from(""));
    }
    cleanZip.writeZip(cleanZipPath);

    assert.deepStrictEqual(findBundledExportBinaryEntries(cleanZipPath), []);
    assert.doesNotThrow(() => assertNoBundledExportBinaries(cleanZipPath));
    assert.deepStrictEqual(findMissingReleaseZipEntries(cleanZipPath), []);
    assert.doesNotThrow(() => assertReleaseZipStructure(cleanZipPath));

    const incompleteZipPath = path.join(tempRoot, "incomplete.zip");
    const incompleteZip = new AdmZip();
    for (const entryName of releaseZipRequiredEntries.filter(entryName => entryName !== "com.f_know.f_record.generator/package.json")) {
        incompleteZip.addFile(entryName, Buffer.from(""));
    }
    incompleteZip.writeZip(incompleteZipPath);

    assert.deepStrictEqual(
        findMissingReleaseZipEntries(incompleteZipPath),
        ["com.f_know.f_record.generator/package.json"],
    );
    assert.throws(
        () => assertReleaseZipStructure(incompleteZipPath),
        /Release zip is missing required entries/,
    );

    const bundledZipPath = path.join(tempRoot, "bundled.zip");
    const bundledZip = new AdmZip();
    bundledZip.addFile("com.f_know.f_record.cep/ffmpeg.exe", Buffer.from(""));
    bundledZip.addFile("com.f_know.f_record.cep/tools/ffprobe", Buffer.from(""));
    bundledZip.addFile("com.f_know.f_record.cep/js/exportReplayUtils.js", Buffer.from(""));
    bundledZip.writeZip(bundledZipPath);

    assert.deepStrictEqual(
        findBundledExportBinaryEntries(bundledZipPath),
        [
            "com.f_know.f_record.cep/ffmpeg.exe",
            "com.f_know.f_record.cep/tools/ffprobe",
        ],
    );
    assert.throws(
        () => assertNoBundledExportBinaries(bundledZipPath),
        /Bundled ffmpeg\/ffprobe binaries are not allowed/,
    );

    assert.strictEqual(shouldCopyNodePackageEntry(""), true);
    assert.strictEqual(shouldCopyNodePackageEntry(path.join("lib", "index.js")), true);
    assert.strictEqual(shouldCopyNodePackageEntry(path.join("coverage", "index.html")), false);
    assert.strictEqual(shouldCopyNodePackageEntry(path.join("node_modules", "child", "index.js")), false);
} finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
}
