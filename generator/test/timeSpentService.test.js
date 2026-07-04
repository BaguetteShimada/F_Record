const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-time-spent-"));
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
        const { updateDocumentTimeSpent } = require("../src/timeSpentService");
        const {
            ensureDocumentValue,
            readDocumentValue,
            writeDocumentValue,
        } = require("../src/documentStore");

        const documentCreateTime = "2026-07-03-12-00-00-000";
        const configData = { isEnabled: true, idleTimeout: "1" };
        const nowDocument = { id: 7, createTime: documentCreateTime };
        const events = [];

        ensureDocumentValue(documentCreateTime);
        writeDocumentValue(documentCreateTime, {
            count: 2,
            timeSpent: 4,
            lastModifiedTime: 1000,
        });

        const result = await updateDocumentTimeSpent({
            configData,
            nowDocument,
            mutex: createMutex(events),
            nowMsFactory: () => 30 * 1000,
        });

        assert.deepStrictEqual(events, ["lock", "unlock"]);
        assert.deepStrictEqual(result, {
            updated: true,
            documentValue: {
                count: 2,
                timeSpent: 5,
                lastModifiedTime: 1000,
            },
        });
        assert.deepStrictEqual(readDocumentValue(documentCreateTime), result.documentValue);

        assert.deepStrictEqual(
            await updateDocumentTimeSpent({
                configData: { isEnabled: false, idleTimeout: "1" },
                nowDocument,
                mutex: createMutex([]),
            }),
            { updated: false, reason: "disabled" },
        );
        assert.deepStrictEqual(
            await updateDocumentTimeSpent({
                configData,
                nowDocument: { id: null, createTime: null },
                mutex: createMutex([]),
            }),
            { updated: false, reason: "no-document" },
        );
        assert.deepStrictEqual(
            await updateDocumentTimeSpent({
                configData,
                nowDocument: { id: 8, createTime: "missing-document" },
                mutex: createMutex([]),
            }),
            { updated: false, reason: "missing-document-value" },
        );
        assert.deepStrictEqual(
            await updateDocumentTimeSpent({
                configData: null,
                nowDocument,
                mutex: createMutex([]),
            }),
            { updated: false, reason: "not-ready" },
        );

        const failedEvents = [];
        await assert.rejects(
            () => updateDocumentTimeSpent({
                configData,
                nowDocument,
                mutex: createMutex(failedEvents),
                nowMsFactory: () => {
                    throw new Error("clock failed");
                },
            }),
            /clock failed/,
        );
        assert.deepStrictEqual(failedEvents, ["lock", "unlock"]);
        assert.deepStrictEqual(readDocumentValue(documentCreateTime), result.documentValue);
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
