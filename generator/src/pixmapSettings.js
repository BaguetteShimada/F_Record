function createPixmapSettings(documentBounds, pixmapBounds, configData) {
    const scale = calculateScale(documentBounds, configData.resolution);
    return {
        maxDimension: calculateMaxDimension(pixmapBounds, scale),
        saveSettings: createSaveSettings(documentBounds, pixmapBounds, scale, configData.quality),
    };
}

function calculateScale(documentBounds, resolutionValue) {
    const area = (documentBounds.bottom - documentBounds.top) * (documentBounds.right - documentBounds.left);
    const resolution = parseInt(resolutionValue);
    return Math.min(Math.sqrt(resolution * resolution * 16 / 9 / area), 1);
}

function calculateMaxDimension(pixmapBounds, scale) {
    return Math.round(Math.max(
        pixmapBounds.bottom - pixmapBounds.top,
        pixmapBounds.right - pixmapBounds.left,
    ) * scale);
}

function createSaveSettings(documentBounds, pixmapBounds, scale, qualityValue) {
    const saveSettings = {
        format: "jpg",
        quality: parseInt(qualityValue),
        padding: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        },
        extract: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
    };

    if (pixmapBounds.left >= 0) {
        saveSettings.padding.left = Math.round(pixmapBounds.left * scale);
        saveSettings.extract.x = 0;
    } else {
        saveSettings.extract.x = Math.round(-pixmapBounds.left * scale);
        saveSettings.padding.left = 0;
    }
    if (pixmapBounds.top >= 0) {
        saveSettings.padding.top = Math.round(pixmapBounds.top * scale);
        saveSettings.extract.y = 0;
    } else {
        saveSettings.extract.y = Math.round(-pixmapBounds.top * scale);
        saveSettings.padding.top = 0;
    }
    if (pixmapBounds.right <= documentBounds.right) {
        saveSettings.padding.right = Math.round((documentBounds.right - pixmapBounds.right) * scale);
        saveSettings.extract.width = Math.max(1, Math.round((pixmapBounds.right - pixmapBounds.left) * scale) - saveSettings.extract.x);
    } else {
        saveSettings.extract.width = Math.max(1, Math.round((documentBounds.right - Math.max(0, pixmapBounds.left)) * scale));
        saveSettings.padding.right = 0;
    }
    if (pixmapBounds.bottom <= documentBounds.bottom) {
        saveSettings.padding.bottom = Math.round((documentBounds.bottom - pixmapBounds.bottom) * scale);
        saveSettings.extract.height = Math.max(1, Math.round((pixmapBounds.bottom - pixmapBounds.top) * scale) - saveSettings.extract.y);
    } else {
        saveSettings.extract.height = Math.max(1, Math.round((documentBounds.bottom - Math.max(0, pixmapBounds.top)) * scale));
        saveSettings.padding.bottom = 0;
    }

    return saveSettings;
}

module.exports = {
    calculateMaxDimension,
    calculateScale,
    createSaveSettings,
    createPixmapSettings,
};
