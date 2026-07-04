const assert = require("assert");
const { syncDocumentCreateTime } = require("../src/documentSettingsService");

(async () => {
    const documentInfo = { id: 7 };

    const persistedSettings = [];
    const documentSettings = {};
    const knownCreateTimes = {};
    const createdTime = await syncDocumentCreateTime({
        generator: {
            setDocumentSettingsForPlugin: async (settings, pluginName) => {
                persistedSettings.push([settings, pluginName]);
            },
        },
        pluginName: "F_Record",
        documentInfo,
        documentSettings,
        documentIdToCreateTime: knownCreateTimes,
        createTimeFactory: () => "2026-07-04-12-00-00-000",
    });

    assert.strictEqual(createdTime, "2026-07-04-12-00-00-000");
    assert.deepStrictEqual(documentSettings, { createTime: "2026-07-04-12-00-00-000" });
    assert.deepStrictEqual(knownCreateTimes, { 7: "2026-07-04-12-00-00-000" });
    assert.deepStrictEqual(persistedSettings, [[documentSettings, "F_Record"]]);

    const cachedSettings = {};
    const cachedCreateTimes = { 7: "cached" };
    const cachedTime = await syncDocumentCreateTime({
        generator: {
            setDocumentSettingsForPlugin: async () => {},
        },
        pluginName: "F_Record",
        documentInfo,
        documentSettings: cachedSettings,
        documentIdToCreateTime: cachedCreateTimes,
        createTimeFactory: () => "new",
    });

    assert.strictEqual(cachedTime, "cached");
    assert.deepStrictEqual(cachedSettings, { createTime: "cached" });
    assert.deepStrictEqual(cachedCreateTimes, { 7: "cached" });

    const existingSettings = { createTime: "existing" };
    const existingCreateTimes = {};
    const existingTime = await syncDocumentCreateTime({
        generator: {
            setDocumentSettingsForPlugin: async () => {
                throw new Error("should not persist existing createTime");
            },
        },
        pluginName: "F_Record",
        documentInfo,
        documentSettings: existingSettings,
        documentIdToCreateTime: existingCreateTimes,
        createTimeFactory: () => "new",
    });

    assert.strictEqual(existingTime, "existing");
    assert.deepStrictEqual(existingSettings, { createTime: "existing" });
    assert.deepStrictEqual(existingCreateTimes, { 7: "existing" });
})().catch(error => {
    console.error(error);
    process.exit(1);
});
