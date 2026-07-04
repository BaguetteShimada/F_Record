const assert = require("assert");
const {
    createBoundsOnlyPixmapOptions,
    createScaledPixmapOptions,
} = require("../src/pixmapRequestOptions");

const documentBounds = { left: 0, top: 0, right: 1920, bottom: 1080 };

assert.deepStrictEqual(
    createBoundsOnlyPixmapOptions(documentBounds),
    {
        inputRect: documentBounds,
        outputRect: documentBounds,
        boundsOnly: true,
    },
);

assert.deepStrictEqual(
    createScaledPixmapOptions(documentBounds, 960),
    {
        inputRect: documentBounds,
        outputRect: documentBounds,
        maxDimension: 960,
    },
);
