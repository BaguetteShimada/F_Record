const assert = require("assert");
const { syncNowDocument } = require("../src/documentSyncService");

const documentInfo = {
    id: 7,
    file: "C:\\Users\\Admin\\Pictures\\Sketch.psd",
    bounds: { left: 0, top: 0, right: 100, bottom: 100 },
};

(async () => {
    const persistedSettings = [];
    const writes = [];
    const ensuredDocumentValues = [];
    const knownCreateTimes = {};
    const generator = {
        getDocumentInfo: async () => documentInfo,
        getDocumentSettingsForPlugin: async (documentId, pluginName) => {
            assert.strictEqual(documentId, 7);
            assert.strictEqual(pluginName, "F_Record");
            return {};
        },
        setDocumentSettingsForPlugin: async (settings, pluginName) => {
            persistedSettings.push([settings, pluginName]);
        },
    };

    const nowDocument = await syncNowDocument({
        generator,
        pluginName: "F_Record",
        documentIdToCreateTime: knownCreateTimes,
        captureGate: { isActive: () => true },
        createTimeFactory: () => "2026-07-03-12-00-00-000",
        ensureDocumentValue: documentCreateTime => ensuredDocumentValues.push(documentCreateTime),
        writeNowDocument: document => writes.push(document),
        resetNowDocument: () => {
            throw new Error("should not reset active document");
        },
    });

    assert.deepStrictEqual(persistedSettings, [[{ createTime: "2026-07-03-12-00-00-000" }, "F_Record"]]);
    assert.deepStrictEqual(knownCreateTimes, { 7: "2026-07-03-12-00-00-000" });
    assert.deepStrictEqual(ensuredDocumentValues, ["2026-07-03-12-00-00-000"]);
    assert.deepStrictEqual(nowDocument, {
        id: 7,
        createTime: "2026-07-03-12-00-00-000",
        name: "Sketch",
        isGettingImage: true,
        bounds: { left: 0, top: 0, right: 100, bottom: 100 },
    });
    assert.deepStrictEqual(writes, [nowDocument]);

    const existingSettingsCalls = [];
    const existingNowDocument = await syncNowDocument({
        generator: {
            getDocumentInfo: async () => documentInfo,
            getDocumentSettingsForPlugin: async () => ({ createTime: "existing" }),
            setDocumentSettingsForPlugin: async () => {
                throw new Error("should not persist existing createTime");
            },
        },
        pluginName: "F_Record",
        documentIdToCreateTime: {},
        captureGate: { isActive: () => false },
        ensureDocumentValue: documentCreateTime => existingSettingsCalls.push(["ensure", documentCreateTime]),
        writeNowDocument: document => existingSettingsCalls.push(["write", document.isGettingImage]),
    });

    assert.strictEqual(existingNowDocument.createTime, "existing");
    assert.strictEqual(existingNowDocument.isGettingImage, false);
    assert.deepStrictEqual(existingSettingsCalls, [
        ["ensure", "existing"],
        ["write", false],
    ]);

    const resetDocument = { id: null, createTime: null };
    const failedNowDocument = await syncNowDocument({
        generator: {
            getDocumentInfo: async () => {
                throw new Error("Photoshop unavailable");
            },
        },
        pluginName: "F_Record",
        documentIdToCreateTime: {},
        captureGate: { isActive: () => true },
        ensureDocumentValue: () => {
            throw new Error("should not ensure after sync failure");
        },
        writeNowDocument: () => {
            throw new Error("should not write after sync failure");
        },
        resetNowDocument: () => resetDocument,
    });

    assert.strictEqual(failedNowDocument, resetDocument);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
