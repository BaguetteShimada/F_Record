const assert = require("assert");
const {
    createCaptureSavedResult,
    createCaptureSkippedResult,
} = require("../src/captureFrameResult");

const documentValue = {
    count: 3,
    timeSpent: 7,
    lastModifiedTime: 12345,
};

assert.deepStrictEqual(
    createCaptureSkippedResult("missing-document-value"),
    {
        saved: false,
        reason: "missing-document-value",
    },
);

assert.deepStrictEqual(
    createCaptureSavedResult("C:/recordings/000003.jpg", "000003.jpg", documentValue),
    {
        saved: true,
        imageFilePath: "C:/recordings/000003.jpg",
        imageName: "000003.jpg",
        documentValue,
    },
);
