function createBoundsOnlyPixmapOptions(documentBounds) {
    return {
        inputRect: documentBounds,
        outputRect: documentBounds,
        boundsOnly: true,
    };
}

function createScaledPixmapOptions(documentBounds, maxDimension) {
    return {
        inputRect: documentBounds,
        outputRect: documentBounds,
        maxDimension,
    };
}

module.exports = {
    createBoundsOnlyPixmapOptions,
    createScaledPixmapOptions,
};
