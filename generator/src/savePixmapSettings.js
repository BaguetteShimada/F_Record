const DEFAULT_BACKGROUND_COLOR = { r: 255, g: 255, b: 255 };

function normalizeSavePixmapSettings(pixmap, saveSettings) {
    return Object.assign({
        format: "jpg",
        quality: 70,
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        extract: { x: 0, y: 0, width: pixmap.width || 0, height: pixmap.height || 0 },
        backgroundColor: DEFAULT_BACKGROUND_COLOR,
    }, saveSettings);
}

function getSavePixmapFormatType(format) {
    return typeof format === "string" ? format.toLowerCase() : "jpg";
}

function getTargetImageSize(extract, padding) {
    return {
        width: extract.width + padding.left + padding.right,
        height: extract.height + padding.top + padding.bottom,
    };
}

function clampJpgQuality(quality) {
    return Math.min(Math.max(0, quality), 100);
}

module.exports = {
    DEFAULT_BACKGROUND_COLOR,
    clampJpgQuality,
    getSavePixmapFormatType,
    getTargetImageSize,
    normalizeSavePixmapSettings,
};
