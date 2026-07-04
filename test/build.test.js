const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const {
    assertNoBundledExportBinaries,
    findBundledExportBinaryEntries,
    shouldCopyNodePackageEntry,
} = require("../build");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-build-test-"));

try {
    const cleanZipPath = path.join(tempRoot, "clean.zip");
    const cleanZip = new AdmZip();
    cleanZip.addFile("com.f_know.f_record.cep/js/exportReplay.js", Buffer.from(""));
    cleanZip.addFile("com.f_know.f_record.generator/index.js", Buffer.from(""));
    cleanZip.writeZip(cleanZipPath);

    assert.deepStrictEqual(findBundledExportBinaryEntries(cleanZipPath), []);
    assert.doesNotThrow(() => assertNoBundledExportBinaries(cleanZipPath));

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
