function assertValidSavePixmapInput(pixmap, filePath, saveSettings) {
    if (!pixmap || !filePath || !saveSettings) {
        throw new Error("缺少必要参数");
    }

    if (!pixmap.pixels || !Buffer.isBuffer(pixmap.pixels)) {
        throw new Error("无效的像素数据");
    }
}

module.exports = {
    assertValidSavePixmapInput,
};
