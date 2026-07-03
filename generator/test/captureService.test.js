const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-capture-"));
const originalUserProfile = process.env.USERPROFILE;
const originalHome = process.env.HOME;

if (process.platform === "win32") {
    process.env.USERPROFILE = tempRoot;
} else {
    process.env.HOME = tempRoot;
}

function createMutex(events) {
    return {
        lock: async () => {
            events.push("lock");
            return () => events.push("unlock");
        },
    };
}

(async () => {
    try {
        const { saveCaptureFrame } = require("../src/captureService");
        const { ensureDocumentValue, readDocumentValue } = require("../src/documentStore");

        const processImageFolderPath = path.join(tempRoot, "processImages");
        const documentCreateTime = "2026-07-03-12-00-00-000";
        const events = [];

        ensureDocumentValue(documentCreateTime);
        const result = await saveCaptureFrame({
            mutex: createMutex(events),
            documentCreateTime,
            configData: { processImageFolderPath },
            pixmap: { pixels: "image" },
            saveSettings: { quality: 70 },
            nowMsFactory: () => 12345,
            savePixmapFn: async (pixmap, imageFilePath, saveSettings) => {
                assert.deepStrictEqual(pixmap, { pixels: "image" });
                assert.deepStrictEqual(saveSettings, { quality: 70 });
                fs.writeFileSync(imageFilePath, "saved");
            },
        });

        assert.deepStrictEqual(events, ["lock", "unlock"]);
        assert.strictEqual(result.saved, true);
        assert.strictEqual(result.imageName, "000001.jpg");
        assert.ok(result.imageFilePath.endsWith(path.join(documentCreateTime, "000001.jpg")));
        assert.strictEqual(fs.readFileSync(result.imageFilePath, "utf-8"), "saved");
        assert.deepStrictEqual(readDocumentValue(documentCreateTime), {
            count: 1,
            timeSpent: 0,
            lastModifiedTime: 12345,
        });

        const missingEvents = [];
        const missingResult = await saveCaptureFrame({
            mutex: createMutex(missingEvents),
            documentCreateTime: "missing-document",
            configData: { processImageFolderPath },
            pixmap: {},
            saveSettings: {},
            savePixmapFn: async () => {
                throw new Error("should not save");
            },
        });
        assert.deepStrictEqual(missingEvents, ["lock", "unlock"]);
        assert.deepStrictEqual(missingResult, { saved: false, reason: "missing-document-value" });

        await assert.rejects(
            () => saveCaptureFrame({
                mutex: createMutex([]),
                documentCreateTime,
                configData: { processImageFolderPath },
                pixmap: {},
                saveSettings: {},
                savePixmapFn: async () => {
                    throw new Error("save failed");
                },
            }),
            /save failed/,
        );
        assert.deepStrictEqual(readDocumentValue(documentCreateTime), {
            count: 1,
            timeSpent: 0,
            lastModifiedTime: 12345,
        });
    } finally {
        if (originalUserProfile === undefined) {
            delete process.env.USERPROFILE;
        } else {
            process.env.USERPROFILE = originalUserProfile;
        }
        if (originalHome === undefined) {
            delete process.env.HOME;
        } else {
            process.env.HOME = originalHome;
        }
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
