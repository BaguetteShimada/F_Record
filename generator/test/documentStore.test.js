const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-record-store-"));
const originalUserProfile = process.env.USERPROFILE;
const originalHome = process.env.HOME;

if (process.platform === "win32") {
    process.env.USERPROFILE = tempRoot;
} else {
    process.env.HOME = tempRoot;
}

try {
    const {
        ensureDocumentValue,
        hasDocumentValue,
        readDocumentValue,
        resetNowDocument,
        updateDocumentValue,
    } = require("../src/documentStore");
    const { F_Record_Dir, getDocumentValueFilePath, nowDocumentFilePath } = require("../src/paths");

    assert.ok(F_Record_Dir.startsWith(tempRoot));

    const documentCreateTime = "2026-07-03-12-00-00-000";
    assert.strictEqual(hasDocumentValue(documentCreateTime), false);

    ensureDocumentValue(documentCreateTime);
    assert.strictEqual(hasDocumentValue(documentCreateTime), true);
    assert.deepStrictEqual(
        readDocumentValue(documentCreateTime),
        { count: 0, timeSpent: 0, lastModifiedTime: null },
    );
    assert.ok(fs.existsSync(getDocumentValueFilePath(documentCreateTime)));

    const updatedDocumentValue = updateDocumentValue(documentCreateTime, documentValue => ({
        count: documentValue.count + 1,
        timeSpent: documentValue.timeSpent + 2,
        lastModifiedTime: 12345,
    }));
    assert.deepStrictEqual(
        updatedDocumentValue,
        { count: 1, timeSpent: 2, lastModifiedTime: 12345 },
    );
    assert.deepStrictEqual(readDocumentValue(documentCreateTime), updatedDocumentValue);

    const resetDocument = resetNowDocument();
    assert.deepStrictEqual(resetDocument, {
        id: null,
        createTime: null,
        name: null,
        isGettingImage: null,
        bounds: null,
    });
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(nowDocumentFilePath, "utf-8")), resetDocument);
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
