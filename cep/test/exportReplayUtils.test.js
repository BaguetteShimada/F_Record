const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
    calculateExportProgress,
    calculateExportVideoSize,
    checkJPGIntegrity,
    copyValidReplayImages,
    createExportError,
    listReplayImageFiles,
    resolveExportBinaries,
    serializeError,
} = require("../src/js/exportReplayUtils");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-export-utils-"));

try {
    fs.writeFileSync(path.join(tempRoot, "10.jpg"), Buffer.from([0xFF, 0xD8, 0x10, 0xFF, 0xD9]));
    fs.writeFileSync(path.join(tempRoot, "2.JPG"), Buffer.from([0xFF, 0xD8, 0x20, 0xFF, 0xD9]));
    fs.writeFileSync(path.join(tempRoot, "001.jpeg"), Buffer.from([0xFF, 0xD8, 0x30, 0xFF, 0xD9]));
    fs.writeFileSync(path.join(tempRoot, "note.txt"), "ignore");
    fs.writeFileSync(path.join(tempRoot, "preview.png"), "ignore");

    assert.deepStrictEqual(
        listReplayImageFiles(tempRoot),
        ["001.jpeg", "2.JPG", "10.jpg"],
    );

    assert.strictEqual(checkJPGIntegrity(path.join(tempRoot, "001.jpeg")), true);

    const invalidStartPath = path.join(tempRoot, "invalid-start.jpg");
    const invalidEndPath = path.join(tempRoot, "invalid-end.jpg");
    const missingPath = path.join(tempRoot, "missing.jpg");
    fs.writeFileSync(invalidStartPath, Buffer.from([0x00, 0xD8, 0x10, 0xFF, 0xD9]));
    fs.writeFileSync(invalidEndPath, Buffer.from([0xFF, 0xD8, 0x10, 0x00, 0xD9]));

    assert.strictEqual(checkJPGIntegrity(invalidStartPath), false);
    assert.strictEqual(checkJPGIntegrity(invalidEndPath), false);
    assert.strictEqual(checkJPGIntegrity(missingPath), false);

    const sourceSequencePath = path.join(tempRoot, "source-sequence");
    const exportSequencePath = path.join(tempRoot, "export-sequence");
    fs.mkdirSync(sourceSequencePath);
    fs.mkdirSync(exportSequencePath);
    fs.writeFileSync(path.join(sourceSequencePath, "1.jpg"), Buffer.from([0xFF, 0xD8, 0x01, 0xFF, 0xD9]));
    fs.writeFileSync(path.join(sourceSequencePath, "2.jpg"), Buffer.from([0xFF, 0xD8, 0x02, 0x00, 0xD9]));
    fs.writeFileSync(path.join(sourceSequencePath, "3.jpg"), Buffer.from([0xFF, 0xD8, 0x03, 0xFF, 0xD9]));

    const visitedFiles = [];
    assert.strictEqual(
        copyValidReplayImages(
            sourceSequencePath,
            ["1.jpg", "2.jpg", "3.jpg"],
            exportSequencePath,
            {
                onFile: file => visitedFiles.push(file),
            },
        ),
        2,
    );
    assert.deepStrictEqual(visitedFiles, ["1.jpg", "2.jpg", "3.jpg"]);
    assert.deepStrictEqual(fs.readdirSync(exportSequencePath).sort(), ["000001.jpg", "000002.jpg"]);
    assert.deepStrictEqual(
        fs.readFileSync(path.join(exportSequencePath, "000001.jpg")),
        Buffer.from([0xFF, 0xD8, 0x01, 0xFF, 0xD9]),
    );
    assert.deepStrictEqual(
        fs.readFileSync(path.join(exportSequencePath, "000002.jpg")),
        Buffer.from([0xFF, 0xD8, 0x03, 0xFF, 0xD9]),
    );

    assert.deepStrictEqual(
        calculateExportVideoSize(
            { resolution: "1080" },
            { bounds: { left: 0, top: 0, right: 1920, bottom: 1080 } },
            { aspectRatio: "0" },
        ),
        { width: 1920, height: 1080 },
    );

    assert.deepStrictEqual(
        calculateExportVideoSize(
            { resolution: "1080" },
            { bounds: { left: 0, top: 0, right: 1920, bottom: 1080 } },
            { aspectRatio: "1" },
        ),
        { width: 1440, height: 1440 },
    );

    const statusInfo = [
        { status: "loading image...", ratio: 0.1 },
        { status: "generating video...", ratio: 0.8 },
        { status: "saving video...", ratio: 0.05 },
        { status: "saving video...", ratio: 0.05 },
    ];

    assert.deepStrictEqual(
        calculateExportProgress(statusInfo, 0, -1),
        { status: "loading image...", percent: 0 },
    );
    assert.deepStrictEqual(
        calculateExportProgress(statusInfo, 1, 0.5),
        { status: "generating video...", percent: 50 },
    );
    assert.deepStrictEqual(
        calculateExportProgress(statusInfo, 3, 2),
        { status: "saving video...", percent: 100 },
    );

    const error = new Error("ffmpeg failed");
    error.code = "FFMPEG";
    const serializedError = serializeError(error);
    assert.strictEqual(serializedError.name, "Error");
    assert.strictEqual(serializedError.message, "ffmpeg failed");
    assert.strictEqual(serializedError.code, "FFMPEG");
    assert.ok(serializedError.stack.indexOf("ffmpeg failed") >= 0);

    assert.deepStrictEqual(
        serializeError({ reason: "unknown" }),
        { reason: "unknown", message: "Export worker failed" },
    );
    assert.deepStrictEqual(
        serializeError("failed"),
        { name: "Error", message: "failed" },
    );

    const codedError = createExportError("EXPORT_VALID_IMAGE_FILES_EMPTY", "No valid image files found");
    assert.strictEqual(codedError.code, "EXPORT_VALID_IMAGE_FILES_EMPTY");
    assert.strictEqual(codedError.message, "No valid image files found");

    const ffmpegPath = path.join(tempRoot, "ffmpeg.exe");
    const ffprobePath = path.join(tempRoot, "ffprobe.exe");
    const pathFfmpegPath = path.join(tempRoot, "path-ffmpeg.exe");
    const pathFfprobePath = path.join(tempRoot, "path-ffprobe.exe");
    fs.writeFileSync(ffmpegPath, "ffmpeg");
    fs.writeFileSync(ffprobePath, "ffprobe");
    fs.writeFileSync(pathFfmpegPath, "ffmpeg");
    fs.writeFileSync(pathFfprobePath, "ffprobe");

    assert.deepStrictEqual(
        resolveExportBinaries({
            env: {
                F_RECORD_FFMPEG_PATH: `"${ffmpegPath}"`,
                F_RECORD_FFPROBE_PATH: `"${ffprobePath}"`,
            },
        }),
        {
            ffmpeg: ffmpegPath,
            ffprobe: ffprobePath,
        },
    );

    assert.deepStrictEqual(
        resolveExportBinaries({
            env: {},
            execFileSync: (command, args) => {
                assert.strictEqual(command, "where");
                if (args[0] === "ffmpeg") {
                    return `${pathFfmpegPath}\r\n`;
                }
                if (args[0] === "ffprobe") {
                    return `${pathFfprobePath}\r\n`;
                }
                return "";
            },
            platform: "win32",
        }),
        {
            ffmpeg: pathFfmpegPath,
            ffprobe: pathFfprobePath,
        },
    );

    assert.throws(
        () => resolveExportBinaries({
            env: { F_RECORD_FFMPEG_PATH: path.join(tempRoot, "missing-ffmpeg.exe") },
            execFileSync: () => "",
            platform: "win32",
        }),
        error => {
            assert.strictEqual(error.code, "MISSING_EXPORT_BINARY");
            assert.strictEqual(error.binaryName, "ffmpeg");
            assert.strictEqual(error.binarySource, path.join(tempRoot, "missing-ffmpeg.exe"));
            return /Missing export binary/.test(error.message) && /F_RECORD_FFMPEG_PATH/.test(error.message);
        },
    );
} finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
}
