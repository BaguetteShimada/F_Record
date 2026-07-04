function assignSavePixmapBitmap(image, buffer, targetSize) {
    image.bitmap.data = buffer;
    image.bitmap.width = targetSize.width;
    image.bitmap.height = targetSize.height;
    return image;
}

function createSavePixmapImage(JimpConstructor, targetSize, buffer) {
    const image = new JimpConstructor(targetSize.width, targetSize.height);
    return assignSavePixmapBitmap(image, buffer, targetSize);
}

module.exports = {
    assignSavePixmapBitmap,
    createSavePixmapImage,
};
