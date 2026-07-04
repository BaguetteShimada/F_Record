const { clampJpgQuality } = require("./savePixmapSettings");

async function writeSavePixmapImage(image, filePath, formatType, quality) {
    if (formatType === "png") {
        await image.writeAsync(filePath);
        return;
    }

    await image.quality(clampJpgQuality(quality)).writeAsync(filePath);
}

module.exports = {
    writeSavePixmapImage,
};
