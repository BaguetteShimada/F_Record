const assert = require("assert");
const {
    buildNowDocument,
    getNowTimeString,
    resolveDocumentCreateTime,
} = require("../src/documentState");

const documentInfo = {
    id: 7,
    file: "C:\\Users\\Admin\\Pictures\\Sketch.psd",
    bounds: { left: 0, top: 0, right: 100, bottom: 100 },
};

assert.deepStrictEqual(
    resolveDocumentCreateTime(documentInfo, { createTime: "existing" }, {}, () => "new"),
    { createTime: "existing", shouldPersist: false },
);

assert.deepStrictEqual(
    resolveDocumentCreateTime(documentInfo, {}, { 7: "cached" }, () => "new"),
    { createTime: "cached", shouldPersist: true },
);

assert.deepStrictEqual(
    resolveDocumentCreateTime(documentInfo, {}, {}, () => "new"),
    { createTime: "new", shouldPersist: true },
);

assert.deepStrictEqual(
    buildNowDocument(documentInfo, "2026-07-03-12-00-00-000", true),
    {
        id: 7,
        createTime: "2026-07-03-12-00-00-000",
        name: "Sketch",
        isGettingImage: true,
        bounds: { left: 0, top: 0, right: 100, bottom: 100 },
    },
);

assert.match(getNowTimeString(), /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/);
