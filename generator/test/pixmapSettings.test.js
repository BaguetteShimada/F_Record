const assert = require("assert");
const { createPixmapSettings } = require("../src/pixmapSettings");

assert.deepStrictEqual(
    createPixmapSettings(
        { left: 0, top: 0, right: 100, bottom: 100 },
        { left: 10, top: 20, right: 90, bottom: 80 },
        { resolution: "100", quality: "70" },
    ),
    {
        maxDimension: 80,
        saveSettings: {
            format: "jpg",
            quality: 70,
            padding: { left: 10, top: 20, right: 10, bottom: 20 },
            extract: { x: 0, y: 0, width: 80, height: 60 },
        },
    },
);

assert.deepStrictEqual(
    createPixmapSettings(
        { left: 0, top: 0, right: 100, bottom: 100 },
        { left: -10, top: -5, right: 110, bottom: 105 },
        { resolution: "100", quality: "75" },
    ),
    {
        maxDimension: 120,
        saveSettings: {
            format: "jpg",
            quality: 75,
            padding: { left: 0, top: 0, right: 0, bottom: 0 },
            extract: { x: 10, y: 5, width: 100, height: 100 },
        },
    },
);

assert.deepStrictEqual(
    createPixmapSettings(
        { left: 0, top: 0, right: 1920, bottom: 1080 },
        { left: 0, top: 0, right: 1920, bottom: 1080 },
        { resolution: "540", quality: "80" },
    ),
    {
        maxDimension: 960,
        saveSettings: {
            format: "jpg",
            quality: 80,
            padding: { left: 0, top: 0, right: 0, bottom: 0 },
            extract: { x: 0, y: 0, width: 960, height: 540 },
        },
    },
);
